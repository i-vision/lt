<?php

class UsersController extends AppController {


	var $name = 'Users';


	var $helpers = array('Html','Form','Javascript','Text','Paginator');
	var $components = array('Cookie','Session','Email','RequestHandler','Uploader.Uploader');

	var $uses = array('User');

	/*

	function beforeFilter() {
	$this->Cookie->name = 'teacher';
	$this->Cookie->time =  3600;  // or '1 hour'
	$this->Cookie->path = '/';
	$this->Cookie->domain = 'liveteacher.loc';
	$this->Cookie->secure = false;  //i.e. only sent if using secure HTTPS
	$this->Cookie->key = 'qSI232qs*&sXOw!';
	}
	*/

	//REGISTER A NEW USER, SEND CONFIRMATION EMAIL AND RETURN VALUE
	//APP LANGUAGE IS GET FROM USER BROWSER,,

	function register() {



		//$this->autoLayout = false;
		//$this->view = 'Media';
		$userEmail  = $this->params['url']['email'];
		$userPassword  = strtolower($this->params['url']['password']);
		$deviceId = $this->params['url']['deviceid'];
		$appLanguage = $this->params['url']['applanguage'];

		//IS USER ALREDY EXIST IN DB?
		$isAlreadyRegistred =
		$this->User->find('count',
		array('conditions' => array('User.email' => $userEmail,'User.deviceid'=> $deviceId)));
		debug($isAlreadyRegistred);

		//IF NOT
		if($isAlreadyRegistred==0)
		{

			//PREPARE DATA FOR SAVE
			$this->data['User']['email'] =  $userEmail;
			$this->data['User']['password'] =  $userPassword;
			$this->data['User']['verifistring'] = sha1($userEmail);
			$this->data['User']['isverified'] =  0;
			$this->data['User']['deviceid'] = $deviceId;
			$this->data['User']['blocked'] = 0;
			$this->data['User']['countofsign'] = 0;
			$this->data['User']['dateofcreate'] = date("Y-m-d H:i:s");
			$this->data['User']['questionsanswered'] = 0;
			$this->data['User']['applanguage'] = $appLanguage;






			if ($this->User->save($this->data)) {
				debug($this->data);

				//GET USER ID
				$userId = $this->User->find('first',array('conditions' => array('User.email' => $userEmail)));

				//GENERATE AND SEND REGISTRATION MAIL
				$this->Email->from = Configure::read('App.registerEmail');
				$this->Email->to = $this->data['User']['email'];
				$this->Email->subject = __('Potvrzení registrace',true);
				//Template from app/views/elements/email/
				$this->Email->template = 'registrationConfirmation';
				$this->Email->sendAs = 'both';
				//Set values to layout
				$this->set('email',$this->data['User']['email']);
				$this->set('hash',$this->data['User']['verifystring']);
				$this->set('userId',$this->data['User']['id']);
				$this->set('appLanguage',$this->data['User']['applanguage']);



				/* SMTP Options */
				$this->Email->smtpOptions = array(
								        'port'=>Configure::read('App.smtpPort'),
								        'timeout'=>Configure::read('App.mailTimeout'),
				//'host' => Configure::read('App.mailHost')
				);
				/* Set delivery method */
				$this->Email->delivery = 'smtp';




				$this->Email->send();
				$smtpError = $this->Email->smtpError;
				//END SEND MAIL

				debug($smtpError);


				//AND SET STAUTUS FOR SCRIPT
				header('Content-Type: application/json');

				echo "{
\"status\":\"user_sucess_registered\"

}";
			}

		}

		else {
			//USER ALREADY EXIST
			header('Content-Type: application/json');

			echo "{
\"status\":\"user_alredy_exist\"

}";
				

		}

	}



	function verifyRegistration()
	{


		$userId  = $this->params['url']['userid'];
		$userEmail  = $this->params['url']['email'];
		$userHash  = $this->params['url']['hash'];
		$deviceId  = $this->params['url']['deviceid'];
		$appLang  = $this->params['url']['applanguage'];

		//IS USER ALREDY EXIST IN DB?
		$isVerified =
		$this->User->find('count',
		array('conditions' => array('User.email' => $userEmail,'User.deviceid'=> $deviceId, 'User.verifistring'=>$userHash, 'User.isverified'=>0)));





		//IF VERIFY CREDENTIALS ARE TRUE SET THE isverified in DB on 1
		if($isVerified==1)
		{


			$this->data = $isVerified;
			$this->data['User']['isverified'] ="1";

			if ($this->User->save($this->data))
			{


				//debug(APP.Configure::read('App.fileDir').DS.$userId);
				//CREATE A USER DIR WHRE USER FILES WILL BE STORED
				mkdir(APP.Configure::read('App.fileDir').DS.$userId,0777);
				//COPY DEFAULT FILES
				copy(APP.Configure::read('App.loginCookieLife').DS.$appLang.'.csv',APP.Configure::read('App.fileDir').DS.$userId.DS.'test.csv');


				//USER UPDATETD
				$this->set('status', 'true' );
			}


		}

		else
		{




			//USER ALREADY EXIST
			$this->set('status', 'false' );
		}
	}


	function login ()
	{

		$userEmail  = $this->params['url']['email'];
		$userPassword  = strtolower($this->params['url']['password']);

		$isVerified =
		$this->User->find('count',array('conditions' => array('User.email' => $userEmail, 'User.password'=>$userPassword, 'User.isverified'=>1)));

		$userId =
		$this->User->find('all',array('conditions' => array('User.email' => $userEmail, 'User.password'=>$userPassword, 'User.isverified'=>1)));


		if ($isVerified===1)
		{

			//UPDATE TIME OF LAST VISIT IN DB
			$this->User->read(null, $userId[0]["User"]['id']);
			$this->User->set('dateoflastvisit', date("Y-m-d H:i:s"));
			
			
			//INCEREASE COUNT OF SIGNS
			$this->User->set('countofsign',$userId[0]["User"]['countofsign'] +1 );
			
			//SAVE ALL CHANGES
			$this->User->save();
			
			//SET JSON OUTPUT FOR READING AND STORE IN APP
			
			//header('Content-Type: application/json');
			
			//print_r($userId);
				
			echo "{
			\"status\":\"user_sucess_loggedin\",
			\"user_id\":\"".$userId[0]["User"]['id']." \",
			\"user_email\":\"".$userId[0]["User"]['email']." \",
			\"app_languge\":\"".$userId[0]["User"]['applanguage']."\",
			\"questionsanswered\":\"".$userId[0]["User"]['questionsanswered']."\",
			\"translateto\":\"".$userId[0]["User"]['translateto']."\",
			\"lasttheme\":\"".$userId[0]["User"]['lasttheme']."\"
			
			}";
			
			
			
			



		}

		else
		{
			//USER NOT EXIST OR BAD E-MAIL OR PASSSWORD
			//header('Content-Type: application/json');

				
			echo "{
			\"status\":\"user_fail_loggedin\"

			}";
		}


	}

	
	
	
	function updateSettings()
	{
		$userId  =  $this->params['url']['id'];
		$translateTo  = strtolower($this->params['url']['translelanguge']);
		$appLanguage  = strtolower($this->params['url']['applanguge']);
		
		
		
		//READ DTA ABOUT USER
			$this->User->read(null, $userId);
			
			if(!empty($translateTo))
			$this->User->set('translateto', $translateTo);
			
			if(!empty($appLanguage))
			$this->User->set('applanguage', $appLanguage);

			
			
			//SAVE ALL CHANGES
			if($this->User->save())
			{
			//SET JSON OUTPUT FOR READING AND STORE IN APP
			
			header('Content-Type: application/json');
			
			//print_r($userId);
				
			echo "{\"status\":\"sucess_updated\"}";
		
			}
			
			else
			{
			header('Content-Type: application/json');
			
			//print_r($userId);
				
			echo "{\"status\":\"fail_updated}";
				
			}
		
		
		
	}
	

	function account($id)
	{
		print_r ($this->Cookie->read());

	 //VERIFY THAT USER IS is SUCCESSFULLY LOGED IN
	 //print_r( $_COOKIE);
	 //setcookie ("test", "hodnota");

	 //echo($_COOKIE["deviceid"]);
		//JSON OUTPUT
		$this->view = 'Json';

	 $userInfo = $this->User->find('all',array('conditions' => array('User.id' => $id)));
	 //print_r ($userInfo);
	 $json = array(
      'userid' => $userInfo[0]['User']['id'],
      'useremail' => $userInfo[0]['User']['email']
	 );

	 $this->set(compact('json'));


	}

	function translate()

	{

		$textToTranslate = $this->params['url']['text'];

		$translateTo = $this->params['url']['translateto'];
		
		$translateFrom   = file_get_contents('http://api.microsofttranslator.com/V2/Ajax.svc/Detect?appId='.Configure::read('App.translateApiId').'&text='.urlencode($textToTranslate).'');

		$translatedText  = file_get_contents('http://api.microsofttranslator.com/V2/Ajax.svc/Translate?appId='.Configure::read('App.translateApiId').'&from='.$translateFrom.'&to='.$translateTo.'&text='.urlencode($textToTranslate ));
		
		//substr_replace($translatedText, "", 0,1);
		$length = strlen($translatedText);
		//Remove appostrofes form returned translated string, cased NOT valid Json output
		$replacedString = substr($translatedText,4,$length-5);
		
		if(!empty($translatedText))

		{
		$result = "{\"status\":\"success\",\"translatedText\":\"$replacedString\"}";
		}
		
		
		else 
		{
			$result = "{\"status\":\"fail\"}";
		}

		//json_encode($result);
	    //header('Content-Type: application/json');
		$this->set('result',$result);

	}


	function getVoiceOutput()
	{
		$translatedText = $this->params['url']['text'];

		$tranlateTo = $this->params['url']['translateto'];
		
		
		$voiceOutput  = "http://api.microsofttranslator.com/V2/Http.svc/Speak?appId=98BAFD350ACBE1FE601ABF6274820CC03BAAC1D4&text='.$translatedText.'&language='.$translateTo.'&format=audio/wav";
	
		$vopt = str_replace (" ", "", $voiceOutput);
		
		
		
		$this->set('result',$vopt);
		
	}
	
	//GET LIST OF FILES FROM SIGNED USER
	
	function getMyThemes() {
		$userId = $this->params['url']['id'];
		
		
		$dirname= APP.Configure::read('App.fileDir').DS.$userId;
		$dh= opendir($dirname);
		$files=array();
		while (false !== ($entry= readdir($dh)))
		{
			if ( $entry!= '..' && $entry!= '.')
			{
				$files[]=$entry;
				
				
				
				
			}
		}

		
			//SAVE ALL CHANGES
			if(empty($files)|!is_array($files))
			{
			
			//print_r($userId);
				
			$result ="{\"status\":\"no_files\"}";
		
			}
			
			else
			{
		
			$filesList ="";	
			
			foreach ($files as $value)
			{
				$fileContent = file_get_contents(APP.Configure::read('App.fileDir').DS.$userId.DS.$value, true);
				$countOfWords = count(explode(";",$fileContent)); 
				$countOfWords = $countOfWords- 1; 
				
				
				$filesList .= $value.";".$countOfWords.","; 
			}	
				
				
			$result = "{
			\"status\":\"files_sucess\",
			\"files\":\"$filesList\"
			
			
			
			}";
			
			
				
			}
		
		
			$this->set('result',$result);

	}
	
	
		function deleteMyTheme() {
		$userId = $this->params['url']['id'];
		$theme = $this->params['url']['theme'];
		
		
		$filename= APP.Configure::read('App.fileDir').DS.$userId.DS.$theme;
		
		
			if(unlink($filename))
			{
			
			//print_r($userId);
				
			$result ="{\"status\":\"success\"}";
		
			}
			
			else
			{

						
			$result ="{\"status\":\"false\"}";
		
			}
			
			
				
			
		
		
			$this->set('status',$result);

			
	}
	
	
	
function editMyTheme() {
		$userId = $this->params['url']['id'];
		$theme = $this->params['url']['theme'];
		$filename= APP.Configure::read('App.fileDir').DS.$userId.DS.$theme;
		$contentOfFile = file_get_contents($filename);
		
		
			if($contentOfFile)
			{
				
			$text = str_replace(array("\r", "\n"),'', $contentOfFile);
			//JSON OUTPUT SHOLD NOT CONTAIN "\r", "\n", MUST BE REMOVED
				
			$result ="{\"status\":\"success\",\"content\":\"$text\"}";
			json_encode($result);

			
			}
			
			else
			{

			$result ="{\"status\":\"false\"}";
			json_encode($result);
			}
	
		
		    //header('Content-Type: application/json');
			$this->set('result',$result);

			
	}
	
	
	
	
	
	
function updateMyTheme() {
		$userId = $this->params['url']['id'];
		$theme = $this->params['url']['theme'];
		$sentences = $this->params['url']['sentences'];
		
		$filename= APP.Configure::read('App.fileDir').DS.$userId.DS.$theme;
		$contentOfFile = file_get_contents($filename);
		
		
			if($contentOfFile)
			{
			
			//ADD \r\n after every semicolomn
			$updatedSentences  = str_replace(array(";", ","),";\n", $sentences);
			
			
			//DELETE CONTENT OF FILE IF EXIST AND CREATE NEW WITH NEW CONTENT
			$writeToFile = file_put_contents($filename,$updatedSentences);
			
			if(!$writeToFile)		
			{	
			$result ="{\"status\":\"success\"}";
			json_encode($result);
			}
			
			}
			
			else
			{

			$result ="{\"status\":\"false\"}";
			json_encode($result);
			}
	
		
		    header('Content-Type: application/json');
			$this->set('result',$result);

			
	}
	
	
	
	
	
	
	
	//DEFAULT CAKEPHP FUNCTIONS
	//DEFAULT FUNCT
	function index() {
		$this->User->recursive = 0;
		$this->set('users', $this->paginate());
	}


	function view($id = null) {
		if (!$id) {
			$this->Session->setFlash(__('Invalid user', true));
			$this->redirect(array('action' => 'index'));
		}
		$this->set('user', $this->User->read(null, $id));
	}

	function add() {
		if (!empty($this->data)) {
			$this->User->create();
			if ($this->User->save($this->data)) {
				$this->Session->setFlash(__('The user has been saved', true));
				$this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The user could not be saved. Please, try again.', true));
			}
		}
	}

	function edit($id = null) {
		if (!$id && empty($this->data)) {
			$this->Session->setFlash(__('Invalid user', true));
			$this->redirect(array('action' => 'index'));
		}
		if (!empty($this->data)) {
			if ($this->User->save($this->data)) {
				$this->Session->setFlash(__('The user has been saved', true));
				$this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The user could not be saved. Please, try again.', true));
			}
		}
		if (empty($this->data)) {
			$this->data = $this->User->read(null, $id);
		}
	}


	
	
	
	
	function admin_index() {
		$this->User->recursive = 0;
		$this->set('users', $this->paginate());
	}

	function admin_view($id = null) {
		if (!$id) {
			$this->Session->setFlash(__('Invalid user', true));
			$this->redirect(array('action' => 'index'));
		}
		$this->set('user', $this->User->read(null, $id));
	}

	function admin_add() {
		if (!empty($this->data)) {
			$this->User->create();
			if ($this->User->save($this->data)) {
				$this->Session->setFlash(__('The user has been saved', true));
				$this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The user could not be saved. Please, try again.', true));
			}
		}
	}

	function admin_edit($id = null) {
		if (!$id && empty($this->data)) {
			$this->Session->setFlash(__('Invalid user', true));
			$this->redirect(array('action' => 'index'));
		}
		if (!empty($this->data)) {
			if ($this->User->save($this->data)) {
				$this->Session->setFlash(__('The user has been saved', true));
				$this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The user could not be saved. Please, try again.', true));
			}
		}
		if (empty($this->data)) {
			$this->data = $this->User->read(null, $id);
		}
	}

	function admin_delete($id = null) {
		if (!$id) {
			$this->Session->setFlash(__('Invalid id for user', true));
			$this->redirect(array('action'=>'index'));
		}
		if ($this->User->delete($id)) {
			$this->Session->setFlash(__('User deleted', true));
			$this->redirect(array('action'=>'index'));
		}
		$this->Session->setFlash(__('User was not deleted', true));
		$this->redirect(array('action' => 'index'));
	}
}
