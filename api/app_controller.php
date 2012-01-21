	<?php
/**
 * Application level Controller
 *
 * This file is application-wide controller file. You can put all
 * application-wide controller-related methods here.
 *
 * PHP versions 4 and 5
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright 2005-2011, Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright 2005-2011, Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       cake
 * @subpackage    cake.app
 * @since         CakePHP(tm) v 0.2.9
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 */

/**
 * Application Controller
 *
 * Add your application-wide methods in the class below, your controllers
 * will inherit them.
 *
 * @package       cake
 * @subpackage    cake.app
 */
class AppController extends Controller {


var $components = array('Session','Email','RequestHandler','Cookie','Uploader.Uploader');


function beforeFilter() {
  $this->Cookie->name = '';
  $this->Cookie->time =  '1 hour';  // or '1 hour'
  $this->Cookie->path = '';
  $this->Cookie->domain = 'localhost';
  $this->Cookie->secure = false;  //i.e. only sent if using secure HTTPS
  $this->Cookie->key = 'qSI232qs*&sXOw!';
}

}
