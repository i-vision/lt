//Define const

var appUrl = 'http://livetecher.loc/'
var settingsDir = 'settings/';
var settingsFile = "settings.xml";
var settingsFile = "settings.xml";

var sentencesForExam = Array();
var countOfTry = 0;
var countOfSentences;
var countOfGreatAnswers = 0;
var countOfMediumAnswers = 0;
var countOfPoorAnswers = 0;
var myAverage = 0;
var numberOFSentence = 0;
var typeOfUsingTheFile = "";



function translateApp2()
{
	 $._.setLocale('en');

	 $('#example1').append("<div>" + $._('Welcome')+"</div>");

}


function translateApp(trimmedBrowserLang) {
	// TRANSLATE APP

	var translateTo = trimmedBrowserLang;

	jQuery.getScript("translations/" + translateTo + ".js", function() {

		$("h1#loginHeader").text(text['hlavni_menu']);
		$("h1#errorMessageUserEmail").text(text['chybova_zprava_uzemail']);
		$("h1#errorMessageUserPassword").text(text['chybova_zprava_uzheslo']);
		$("h1#errorMessageLoginFailed").text(text['chybova_zprava_loginspatne']);

		// USER ACCOUNT PAGE
		$("h1#userAccountHeader").text(text['header_uzivatelsky_ucet']);
		$("#randomExamineBtn").text(text['btn_nahodne_zkouseni']);
		$("#chooseThemeForExamineBtn").text(text['btn_vybrat_tema']);
		$("#addRemoveEditThemeBtn").text(
				text['btn_pridat_odebrat_editovat_tema']);
		$("#statisticsBtn").text(text['btn_statistiky']);
		$("#setingsBtn").text(text['btn_nastaveni_aplikace']);
		$("#logoutBtn").text(text['btn_odhlaseni']);
		
		$("#answer").text(text['odpoved_zobrazite_klinutim_na_tlacitko_ukaz_odpoved']);
		
		// Rename back btn
		$.mobile.page.prototype.options.backBtnText = "Zpet";

	});
}

function clearRefistationDta() {
	$("#userRegistrationEmail").val("");
	$("#userRegistrationPassword").val("");
}
function registerNewUser() {

	email = $("#userRegistrationEmail").val();
	password = $.encoding.digests.hexSha1Str($("#userRegistrationPassword")
			.val());
	appDefLanguge = $("#userRegistrationLanguage").val();

	if (!isValidEmailAddress(email) | password.length < 5) {

		$("#errorMessRegistration").show();
		$("#errorMessRegistration h1").text(text['chyba_registrace']);

	}

	else {
		$("#errorMessRegistration").hide();

		//
		// IF NOT, DO REQUEST
		// alert(apiUrl + "municipality/" + municipalityCode + ".json");
		jQuery
				.ajax({
					url : "api/users/register?email=" + email + "&password="
							+ password + "&applanguage=" + appDefLanguge + "",
					type : "GET",
					success : function(result) {
						console.log('DATA SENT');
						objectResult = jQuery.parseJSON(result);
						console.log(objectResult.status);

						if (objectResult.status == "user_alredy_exist") {
							$("#errorMessRegistration").show();
							$("#errorMessRegistration h1").text(
									text['uzivatel_existuje']);
							$("#sentNewPasswordBtn").show();

						}

						if (objectResult.status == "user_sucess_registered") {
							$("#errorMessRegistration").show();
							$("#errorMessRegistration h1").text(
									text['uzivatel_uspesne_registrovan']);
							$("#sentNewPasswordBtn").hide();
							$("#goToLoginBtn").show();

							$("#userRegistrationEmail").val("");
							$("#userRegistrationPassword").val("");

						}

					},
					// IF HTTP RESULT 400 || 404
					error : function(x, e) {

						if (x.status == 0) {
							console
									.log('You are offline!!\n Please Check Your Network.');
						} else if (x.status == 404) {
							console.log('Requested URL not found.');
						} else if (x.status == 500) {
							console.log('Internel Server Error');
						} else if (e == 'parsererror') {
							console.log('Error.\nParsing JSON Request failed.');
						} else if (e == 'timeout') {
							console.log('Request Time out.');
						} else {
							console.log('Unknow Error.\n' + x.responseText);
						}

					}
				});

	}

}

function login() {
	email = $("#userLoginEmail").val();
	password = $("#userLoginPassword").val();

	if (!isValidEmailAddress(email) | password.length < 5) {

		$("#errorMessageLoginFailed").show();
		$("#errorMessageLoginFailed h1").text(
				text['chyba_prihlaseni_neplatna_data']);

	}

	else {

		$('#errorDivLoginFailed').hide();

		jQuery
				.ajax({
					url : "api/users/login?email=" + email + "&password="
							+ $.encoding.digests.hexSha1Str(password) + "",
					type : "GET",
					success : function(result) {
						console.log('LOGIN DATA SENT');
						objectResult = jQuery.parseJSON(result);

						if (objectResult.status == "user_fail_loggedin") {
							$("#errorMessageLoginFailed").show();
							$("#errorMessageLoginFailed h1").text(
									text['nespravne_udaje']);
							$("#sentNewPasswordBtn").show();

							console.log("USER LOGGED IN FAIL");

						}

						if (objectResult.status == "user_sucess_loggedin") {

							// REDIRECT TO USER ACCOUNT PAGE

							$.mobile.changePage("#userAccountPage", "slide",
									false, true);

							console.log("USER LOGGED IN");

							console.log("STATUS PRIHLASENI "
									+ objectResult.status);
							console.log("USER ID " + objectResult.user_id);
							console
									.log("USER EMAIL "
											+ objectResult.user_email);
							console
									.log("APP  LANG "
											+ objectResult.app_languge);
							console.log("PRIHLASENI "
									+ objectResult.questionsanswered);
							console.log("TEXTY OREKLADANY DO :"
									+ objectResult.translateto);
							console.log("POSLEDNI SOUBOR OTAZEK : "
									+ objectResult.lasttheme);

							// STORE VALUES IN WEB STORAGE

							localStorage.setItem("user_id",
									objectResult.user_id);

							localStorage.setItem("user_email",
									objectResult.user_email);

							localStorage.setItem("app_languge",
									objectResult.app_languge);

							localStorage.setItem("questionsanswered",
									objectResult.questionsanswered);

							localStorage.setItem("translateto",
									objectResult.translateto);

							localStorage.setItem("lasttheme",
									objectResult.lasttheme);

							if (!objectResult.translateto)

							{

								$("#infoMessMyAccount").show();
								$("#infoMessMyAccount h1").text(
										text['nenastaven_jazyk_prekladu']);
								$("#setTranslateLang").show();
								$("#setTranslateLang").text(text['nastavit']);

							}

						}

					},
					// IF HTTP RESULT 400 || 404
					error : function(x, e) {

						if (x.status == 0) {
							console
									.log('You are offline!!\n Please Check Your Network.');
						} else if (x.status == 404) {
							console.log('Requested URL not found.');
						} else if (x.status == 500) {
							console.log('Internel Server Error');
						} else if (e == 'parsererror') {
							console.log('Error.\nParsing JSON Request failed.');
						} else if (e == 'timeout') {
							console.log('Request Time out.');
						} else {
							console.log('Unknow Error.\n' + x.responseText);
						}

					}
				});

	}
}

// UPDATE APP LANGUAGE SETTINGS
function changeTranslateLang(lang) {
	console.log(lang);

	$("li").css("background-color", "transparent");
	$("#" + lang + "").css("background-color", "red");

	jQuery.ajax({
		url : "api/users/updateSettings?id=" + localStorage.getItem("user_id")
				+ "&translelanguge=" + lang + "",
		type : "GET",
		success : function(result) {
			console.log('LOGIN changeTranslateLang SENT');
			objectResult = jQuery.parseJSON(result);
			console.log(objectResult.status);

			if (objectResult.status == "fail_updated") {

				console.log(objectResult.status);

				$("#infoMessMyAccount").show();
				$("#infoMessMyAccount h1").text(
						text['nenastaven_jazyk_prekladu']);
				$("#setTranslateLang").show();
				$("#setTranslateLang").text(text['nastavit']);

			}

			if (objectResult.status == "sucess_updated") {

				// UPDATE VALUES IN WEB STORAGE

				localStorage.setItem("translateto", lang);

				$("#actualLangForTranslate").hide('slow');
				$("#actualLangForTranslate").text(lang);
				$("#actualLangForTranslate").show('slow');
				$("#messLanguageUpdated h1").text(
						text['jazyk_pro_preklad_nastaven']);
				$("#messLanguageUpdated").show();

			}

		},
		// IF HTTP RESULT 400 || 404
		error : function(x, e) {

			if (x.status == 0) {
				console.log('You are offline!!\n Please Check Your Network.');
			} else if (x.status == 404) {
				console.log('Requested URL not found.');
			} else if (x.status == 500) {
				console.log('Internel Server Error');
			} else if (e == 'parsererror') {
				console.log('Error.\nParsing JSON Request failed.');
			} else if (e == 'timeout') {
				console.log('Request Time out.');
			} else {
				console.log('Unknow Error.\n' + x.responseText);
			}

		}
	});

}

// GET AND HIGHLIHT APP TRANSLATE LANG IF IS SET, IF NOT WRITE IT
function getSettings() {

	// STORE VALUES IN WEB STORAGE

	translateLang = localStorage.getItem("translateto");
	if (!translateLang) {
		$("#actualLangForTranslate").text(text['jazyk_pro_preklad_nenastaven']);
		$("#actualLangForTranslate").show('slow');

		
		$.mobile.changePage("#settingsPage", "slide", false, true);
		console.log("jazyk pro app nenastaven");
		
	}

	else {

		$("#actualLangForTranslate").text(translateLang);
		$("#actualLangForTranslate").show('slow');
		$("#" + translateLang + "").css("background-color", "red");

		
		$.mobile.changePage("#settingsPage", "slide", false, true);
		console.log("jazyk pro app je nastaven a jazyk zvyraznen");	
	}

};

function showMyThemes(typeOfUse) {
	
	typeOfUsingTheFile = typeOfUse;
	

	$.mobile.changePage("#showMyThemesPage", "slide", false, true);

	jQuery
			.ajax({
				url : "api/users/getMyThemes?id="
						+ localStorage.getItem("user_id") + "",
				type : "GET",
				success : function(result) {
					console.log('PARAMS showMyThemes SENT');
					objectResult = jQuery.parseJSON(result);
					console.log(objectResult.status);

					if (objectResult.status == "no_files") {

						console.log("UZIVATEL NEMA NAHRAN ZADNY SOUBOR");

						$("#infoMessMyThemes").show();
						$("#infoMessMyThemes h1").text(
								text['nenalezeny_zadne_soubory']);
						$("#setTranslateLang").show();
						$("#setTranslateLang").text(text['nahrat']);

					}

					if (objectResult.status == "files_sucess") {

						console.log("UZIVATEL MA NEJAKE SOUBORY, VYPISUJI");

						listOfThemes = [];

						listOfThemes = objectResult.files.split(',');
						//Remove last item
						listOfThemes.pop();

						console.log(listOfThemes);

						//Remove all li, form prevous time 
						$('#myThemes li').remove();

						//FILL THE LIST OF ACCIDENTS
						$
								.each(
										listOfThemes,
										function(key, value) {

											countOfSententces = value
													.split(';');
											filename = countOfSententces[0]
													.replace(" ", "");
											remamedName = value.split('.');
											remamedName = remamedName[0]
													.replace("_", " ");

											console
													.log("ORIGINALNI NAZEV SOUBORU "
															+ filename);

											console.log("POCET VET v souboru :"
													+ remamedName + " "
													+ countOfSententces[1]);

											$("#myThemes")
													.append(
															
															
															
															"<li><a onClick=\"fetchSentencesToArray(\'"
																	+ filename
																	+ "\');\" >"
																	+ "<img src=\"/images/linedpaper32.png\" />"
																	+ "<h3>"+remamedName+"</h3>"
																	+ "<p>"+countOfSententces[1]+" otazek</p>"
																	
																	+ "</a></li>");
										});

						$('#myThemes').listview('refresh');


						


					}

				},
				// IF HTTP RESULT 400 || 404
				error : function(x, e) {

					if (x.status == 0) {
						console
								.log('You are offline!!\n Please Check Your Network.');
					} else if (x.status == 404) {
						console.log('Requested URL not found.');
					} else if (x.status == 500) {
						console.log('Internel Server Error');
					} else if (e == 'parsererror') {
						console.log('Error.\nParsing JSON Request failed.');
					} else if (e == 'timeout') {
						console.log('Request Time out.');
					} else {
						console.log('Unknow Error.\n' + x.responseText);
					}

				}
			});

};

// GET ALL USER THEMES FOR EDIT/ DELETE OR ADD
// TODO ALL FUNCTION
function getMyThemes() {

	/*
	 * $("li").css("background-color","transparent");
	 * $("#"+lang+"").css("background-color","red");
	 */

	jQuery
			.ajax({
				url : "api/users/getMyThemes?id="
						+ localStorage.getItem("user_id") + "",
				type : "GET",
				success : function(result) {
					console.log('PARAMS getMyThemes SENT');
					objectResult = jQuery.parseJSON(result);
					console.log(objectResult.status);

					if (objectResult.status == "no_files") {

						console.log("UZIVATEL NEMA NAHRAN ZADNY SOUBOR");

						$("#infoMessMyThemes").show();
						$("#infoMessMyThemes h1").text(
								text['nenalezeny_zadne_soubory']);
						$("#setTranslateLang").show();
						$("#setTranslateLang").text(text['nahrat']);

					}

					if (objectResult.status == "files_sucess") {

						console.log("UZIVATEL MA NEJAKE SOUBORY, VYPISUJI");

						listOfThemes = [];

						listOfThemes = objectResult.files.split(',');
						//Remove last item
						listOfThemes.pop();

						console.log(listOfThemes);

						//Remove all li, form prevous time 
						$('#myQuestionsThemes li').remove();

						//FILL THE LIST OF ACCIDENTS
						$
								.each(
										listOfThemes,
										function(key, value) {

											countOfSententces = value
													.split(';');
											filename = countOfSententces[0]
													.replace(" ", "");
											remamedName = value.split('.');
											remamedName = remamedName[0]
													.replace("_", " ");

											console
													.log("ORIGINALNI NAZEV SOUBORU "
															+ filename);

											console.log("POCET VET v souboru :"
													+ remamedName + " "
													+ countOfSententces[1]);

											$("#myQuestionsThemes")
													.append(
															"<li><div class=\"ui-grid-c\">"
																	+ "<div class=\"ui-block-a\"><br>"
																	+ remamedName
																	+ "</div>"
																	+ "<div class=\"ui-block-b\"><br>"
																	+ countOfSententces[1]
																	+ "</div>"
																	+ "<div class=\"ui-block-c\"><a onClick=\"deleteMyTheme(\'"
																	+ filename
																	+ "\');\"   data-role=\"button\" data-icon=\"delete\">Vymazat</a></div>"
																	+ "<div class=\"ui-block-d\"><a onClick=\"editMyTheme(\'"
																	+ filename
																	+ "\');\"  data-role=\"button\" data-icon=\"gear\">Editovat</a></div></div></li>");
										});

						$('#myQuestionsThemes').listview('refresh');

						/*
						 * $("#actualLangForTranslate").hide('slow');
						 * $("#actualLangForTranslate").text(lang);
						 * $("#actualLangForTranslate").show('slow');
						 * $("#messLanguageUpdated
						 * h1").text(text['jazyk_pro_preklad_nastaven']);
						 * $("#messLanguageUpdated").show();
						 */

					}

				},
				// IF HTTP RESULT 400 || 404
				error : function(x, e) {

					if (x.status == 0) {
						console
								.log('You are offline!!\n Please Check Your Network.');
					} else if (x.status == 404) {
						console.log('Requested URL not found.');
					} else if (x.status == 500) {
						console.log('Internel Server Error');
					} else if (e == 'parsererror') {
						console.log('Error.\nParsing JSON Request failed.');
					} else if (e == 'timeout') {
						console.log('Request Time out.');
					} else {
						console.log('Unknow Error.\n' + x.responseText);
					}

				}
			});

};

function isValidEmailAddress(emailAddress) {
	var pattern = new RegExp(
			/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
	return pattern.test(emailAddress);
};

function prepareForUpload() {
	idOfUser = localStorage.getItem("user_id");

	console.log("ID adresare pro upload je: " + idOfUser.replace(" ", ""));
	console.log('/api/files/' + idOfUser.replace(" ", "") + '/');

	//$('#file_upload').last.remove();

	// UPLOADIFY
	$('#file_upload').uploadify({
		'uploader' : '/uploadify/uploadify.swf',
		'script' : '/uploadify/uploadify.php',
		'cancelImg' : '/uploadify/cancel.png',
		'folder' : '/api/files/' + idOfUser.replace(" ", "") + '/',
		'fileExt' : '*.csv;',
		'multi' : true,
		'sizeLimit' : 102400,
		'auto' : false,
		'onError' : function(event, ID, fileObj, errorObj) {
			alert(errorObj.type + ' Error: ' + errorObj.info);
		},
		'onAllComplete' : function(event, data) {
			alert(data.filesUploaded + ' files uploaded successfully!');
		}
	});

}

function deleteMyTheme(nameOfTheme) {

	console.log("ZKOUSIM SMAZAT SOUBOR " + nameOfTheme);
	userId = parseInt(localStorage.getItem("user_id"));

	jQuery.ajax({
		url : "api/users/deleteMyTheme?id=" + userId + "&theme=" + nameOfTheme
				+ "",
		type : "GET",
		success : function(result) {
			console.log('PARAMS deleteMyTheme SENT');
			objectResult = jQuery.parseJSON(result);
			console.log(objectResult.status);

			if (objectResult.status == "false") {

				console.log("SOUBOR SE NEPODARILO SMAZAT");

				$("#infoMessMyThemes").show();
				$("#infoMessMyThemes h1").text(
						text['soubor_se_nepodarilo_smazat']);

			}

			if (objectResult.status == "success") {

				console.log("SOBOR SMAZAN, PROVADIM REFRESH");
				getMyThemes();

			}

		},
		// IF HTTP RESULT 400 || 404
		error : function(x, e) {

			if (x.status == 0) {
				console.log('You are offline!!\n Please Check Your Network.');
			} else if (x.status == 404) {
				console.log('Requested URL not found.');
			} else if (x.status == 500) {
				console.log('Internel Server Error');
			} else if (e == 'parsererror') {
				console.log('Error.\nParsing JSON Request failed.');
			} else if (e == 'timeout') {
				console.log('Request Time out.');
			} else {
				console.log('Unknow Error.\n' + x.responseText);
			}

		}
	});

}

function editMyTheme(nameOfTheme) {

	console.log("ZKOUSIM EDIOVAT SOUBOR " + nameOfTheme);
	userId = parseInt(localStorage.getItem("user_id"));

	jQuery.ajax({
		url : "api/users/editMyTheme",
		type : "GET",
		data : {
			id : userId,
			theme : nameOfTheme
		},
		//dataType: "json",
		success : function(result) {
			console.log('PARAMS editMyTheme SENT');
			objectResult = jQuery.parseJSON(result);
			console.log(objectResult.status);
			console.log('RESPONSE JE ' + result);
			console.log('STATUS JE ' + objectResult.status);

			if (objectResult.status == "false") {

				console.log("SOUBOR SE NEPODARILO NACIST");

				$("#infoMessMyThemes").show();
				$("#infoMessMyThemes h1").text(
						text['soubor_se_nepodarilo_nacist']);

			}

			if (objectResult.status == "success") {

				// REDIRECT TO USER ACCOUNT PAGE

				$.mobile.changePage("#editThemePage", "slide", false, true);

				objectResult.content

				console.log("SOBOR NACTEN, VYPISUJI OTAZKY");

				console.log(objectResult.content);

				var mySentences = objectResult.content.split(";");

				//CLEAR TEXT AREA BEFORE WRITE
				$("#mySentences").text("");

				$.each(mySentences, function(key, value) {
					console.log(key + 1 + ': ' + value);

					$("#mySentences").append(value + "\r\n");

				});

			}

		},
		// IF HTTP RESULT 400 || 404
		error : function(x, e) {

			if (x.status == 0) {
				console.log('You are offline!!\n Please Check Your Network.');
			} else if (x.status == 404) {
				console.log('Requested URL not found.');
			} else if (x.status == 500) {
				console.log('Internel Server Error');
			} else if (e == 'parsererror') {
				console.log('Error.\nParsing JSON Request failed.');
			} else if (e == 'timeout') {
				console.log('Request Time out.');
			} else {
				console.log('Unknow Error.\n' + x.responseText);
			}

		}
	});

}

//

function fetchSentencesToArray(nameOfTheme) {

	
	//IF WE WANT EXAM

	if(typeOfUsingTheFile == "exam")
	{	
	$.mobile.changePage("#examMePage", "slide", false, true);
	

	console.log("ZKOUSIM FETCHNOUT VETY SOUBORU " + nameOfTheme);
	userId = parseInt(localStorage.getItem("user_id"));

	jQuery.ajax({
		url : "api/users/editMyTheme",
		type : "GET",
		data : {
			id : userId,
			theme : nameOfTheme
		},
		//dataType: "json",
		success : function(result) {
			console.log('PARAMS editMyTheme SENT');
			objectResult = jQuery.parseJSON(result);
			console.log(objectResult.status);
			console.log('RESPONSE JE ' + result);
			console.log('STATUS JE ' + objectResult.status);

			if (objectResult.status == "false") {

				console.log("SOUBOR SE NEPODARILO NACIST");

				$("#infoMessMyThemes").show();
				$("#infoMessMyThemes h1").text(
						text['soubor_se_nepodarilo_nacist']);

			}

			if (objectResult.status == "success") {

				// REDIRECT TO USER ACCOUNT PAGE
				
				console.log("SOBOR NACTEN, FETCHUJI OTAZKY");

				console.log(objectResult.content);

				//ADD SENTENCES FOR EXAM INTO GLOBAL ARRAY
				sentencesForExam = objectResult.content.split(";");
				countOfSentences = sentencesForExam.length - 1;
				randomSentence = parseInt(Math.random()*countOfSentences);
				
				
				
				console.log("POCET OTAZEK " +countOfSentences);
				console.log("NAHODNA OTAZKA MA CISLO " +randomSentence);
				console.log("POCET POKUSU " + countOfTry);

				
				if(countOfTry == 0)
				{
					$("#countOfTry").html(countOfTry);
					$("#myAverage").html(myAverage);
					
					getRandomQuestion(randomSentence);
					
				}
				


			}

		},
		// IF HTTP RESULT 400 || 404
		error : function(x, e) {

			if (x.status == 0) {
				console.log('You are offline!!\n Please Check Your Network.');
			} else if (x.status == 404) {
				console.log('Requested URL not found.');
			} else if (x.status == 500) {
				console.log('Internel Server Error');
			} else if (e == 'parsererror') {
				console.log('Error.\nParsing JSON Request failed.');
			} else if (e == 'timeout') {
				console.log('Request Time out.');
			} else {
				console.log('Unknow Error.\n' + x.responseText);
			}

		}
	});
	
	
	
	}
	
	
	//IF WE WANT WRITEOUT SENTENCES FOR TEACHING
	else
	{
	$.mobile.changePage("#teachMePage", "slide", false, true);
	
	

	console.log("ZKOUSIM ZISKAT VETY KE ZKOUSENI SOUBORU " + nameOfTheme);
	userId = parseInt(localStorage.getItem("user_id"));

	jQuery.ajax({
		url : "api/users/editMyTheme",
		type : "GET",
		data : {
			id : userId,
			theme : nameOfTheme
		},
		//dataType: "json",
		success : function(result) {
			console.log('PARAMS editMyTheme SENT');
			objectResult = jQuery.parseJSON(result);
			console.log(objectResult.status);
			console.log('RESPONSE JE ' + result);
			console.log('STATUS JE ' + objectResult.status);

			if (objectResult.status == "false") {

				console.log("SOUBOR SE NEPODARILO NACIST");

				$("#infoMessMyThemes").show();
				$("#infoMessMyThemes h1").text(
						text['soubor_se_nepodarilo_nacist']);

			}

			if (objectResult.status == "success") {

				// REDIRECT TO USER ACCOUNT PAGE
				
				console.log("SOBOR NACTEN, FETCHUJI OTAZKY");

				console.log(objectResult.content);

				var textToTranslate = objectResult.content;
				var translateTo = 'en';
				
				//TRANSLATE 
				jQuery.ajax({
					url : "api/users/translate",
					type : "GET",
					data : {
						text : textToTranslate,
						translateto : translateTo
					},
					success : function(result) {
						//console.log('PARAMS TO TRANSLATE SENT');
						//console.log(result);
						objectResult = jQuery.parseJSON(result);
						//console.log(objectResult.status);

						//console.log('STATUS JE ' + objectResult.status);

						if (objectResult.status == "false") {

							console.log("PREKLAD SE NAZDARIL");

							$("#infoMessMyThemes").show();
							$("#infoMessMyThemes h1").text(
									text['text_se_nepodarilo_prelozit']);

						}

						if (objectResult.status == "success") {
						 //console.log('PRELOZENY TEXT: ' + objectResult.translatedText);
						
						
							//ADD SENTENCES FOR EXAM INTO GLOBAL ARRAY
							translatedSentences = objectResult.translatedText.split(";");
							
							//ADD SENTENCES FOR EXAM INTO GLOBAL ARRAY
							sentencesForTeach = textToTranslate.split(";");
							
							
							
							//WRITOUOT LIST 
							$.each(sentencesForTeach, function(index, value) {
							    console.log("Veta :"+value + ": Preklad: " + translatedSentences[index]);
							    $("#mySentences")
								.append(
										
										
										
										"<li><a  >"
												+ "<img src=\"/images/linedpaper32.png\" />"
												+ "<h3>"+value+"</h3>"
												+ "<p>"+translatedSentences[index]+"</p>"
												+ "</a></li>");
					});

								$('#mySentences').listview('refresh');
							
							
							
						
							
							
							
							
							
							
							
					
						}
						
					},
					// IF HTTP RESULT 400 || 404
					error : function(x, e) {

						if (x.status == 0) {
							console.log('You are offline!!\n Please Check Your Network.');
						} else if (x.status == 404) {
							console.log('Requested URL not found.');
						} else if (x.status == 500) {
							console.log('Internel Server Error');
						} else if (e == 'parsererror') {
							console.log('Error.\nParsing JSON Request failed.');
						} else if (e == 'timeout') {
							console.log('Request Time out.');
						} else {
							console.log('Unknow Error.\n' + x.responseText);
						}

					}
				});
				//END 
			
				
				
	

			}

		},
		// IF HTTP RESULT 400 || 404
		error : function(x, e) {

			if (x.status == 0) {
				console.log('You are offline!!\n Please Check Your Network.');
			} else if (x.status == 404) {
				console.log('Requested URL not found.');
			} else if (x.status == 500) {
				console.log('Internel Server Error');
			} else if (e == 'parsererror') {
				console.log('Error.\nParsing JSON Request failed.');
			} else if (e == 'timeout') {
				console.log('Request Time out.');
			} else {
				console.log('Unknow Error.\n' + x.responseText);
			}

		}
	});
	
	
	
	}
	
	

}





function getVoiceOutput() {

	

	
	textToVoiceOutput  =  $("#answer").text();
	//console.log("ZKOUSIM ZISKAT ZVUKOVY PREKLAD SLOVA " + textToVoiceOutput);
	
	translateToLang = localStorage.getItem("translateto");
	tranlslateLink  = "http://api.microsofttranslator.com/V2/Http.svc/Speak?appId=98BAFD350ACBE1FE601ABF6274820CC03BAAC1D4&text="+textToVoiceOutput+"&language="+translateToLang+"&format=audio/wav";
	
	player ="<audio controls=\"controls\"  style=\"width:100%;\">"+
	"<source id=\"audioSrc\" src=\""+tranlslateLink+"\" type=\"audio/mpeg\" />"+
	"</audio>"
	
	
	
	$("#player").append(player);
}



function getAverage()
{
	myValue =  countOfSentences / countOfTry ; 
	myAverage=Math.round(myValue*10)/10  //returns 28.5
	
	
	$("#myAverage").text(myAverage);
	
}



function updateMyquestions(nameOfTheme) {

	console.log(nameOfTheme);
	console.log("ZKOUSIM UPDATOVAT SOUBOR " + nameOfTheme);
	userId = parseInt(localStorage.getItem("user_id"));
	mySentences = $("#mySentences").val().split("\n");
	sentencesToSend = "";
	//PARSE ARRAY TO STRING which is send as param in URL
	$.each(mySentences, function(key, value) {
		console.log('Veta ' + key + 1 + ': ' + value);

		sentencesToSend += (value + ";");

	});

	console.log("Vety k odeslani: " + sentencesToSend);

	jQuery.ajax({
		url : "api/users/updateMyTheme",
		type : "GET",
		data : {
			id : userId,
			theme : nameOfTheme,
			sentences : sentencesToSend
		},
		//dataType: "json",
		success : function(result) {
			console.log('PARAMS editMyTheme SENT');
			objectResult = jQuery.parseJSON(result);
			console.log(objectResult.status);

			console.log('STATUS JE ' + objectResult.status);

			if (objectResult.status == "false") {

				console.log("SOUBOR SE NEPODARILO UPDATOVAT");

				$("#infoMessMyThemes").show();
				$("#infoMessMyThemes h1").text(
						text['soubor_se_nepodarilo_updatovat']);

			}

			if (objectResult.status == "success") {

				// REDIRECT TO USER ACCOUNT PAGE

				$.mobile.changePage("#editQuestionsThemesPage", "slide", false,
						true);

				getMyThemes();

			}

		},
		// IF HTTP RESULT 400 || 404
		error : function(x, e) {

			if (x.status == 0) {
				console.log('You are offline!!\n Please Check Your Network.');
			} else if (x.status == 404) {
				console.log('Requested URL not found.');
			} else if (x.status == 500) {
				console.log('Internel Server Error');
			} else if (e == 'parsererror') {
				console.log('Error.\nParsing JSON Request failed.');
			} else if (e == 'timeout') {
				console.log('Request Time out.');
			} else {
				console.log('Unknow Error.\n' + x.responseText);
			}

		}
	});

}


function getRandomQuestion(randomSentence)
{
	
	question = sentencesForExam[randomSentence];
	numberOFSentence = randomSentence;
	$("#ratingOnAnswerPannel").hide();
	$("#RateBtn").hide();
	$("#showAnswerBtn").show();
	$("#question").text(question);
	
	translateTo = localStorage.getItem("translateto");
	jQuery.ajax({
		url : "api/users/translate",
		type : "GET",
		data : {
			text : question,
			translateto : translateTo
		},
		success : function(result) {
			console.log('PARAMS TO TRANSLATE SENT');
			console.log(result);
			objectResult = jQuery.parseJSON(result);
			console.log(objectResult.status);

			console.log('STATUS JE ' + objectResult.status);

			if (objectResult.status == "false") {

				console.log("PREKLAD SE NAZDARIL");

				$("#infoMessMyThemes").show();
				$("#infoMessMyThemes h1").text(
						text['text_se_nepodarilo_prelozit']);

			}

			if (objectResult.status == "success") {
			console.log('PRELOZENY TEXT: ' + objectResult.translatedText);
	
			//$("#answer").hide();
			
			
			$("#showAnswerBtn").show();

			$("#answer").text(text['odpoved_zobrazite_klinutim_na_tlacitko_ukaz_odpoved']);
			
			$("#hiddenAnswer").text(objectResult.translatedText);


			}

		},
		// IF HTTP RESULT 400 || 404
		error : function(x, e) {

			if (x.status == 0) {
				console.log('You are offline!!\n Please Check Your Network.');
			} else if (x.status == 404) {
				console.log('Requested URL not found.');
			} else if (x.status == 500) {
				console.log('Internel Server Error');
			} else if (e == 'parsererror') {
				console.log('Error.\nParsing JSON Request failed.');
			} else if (e == 'timeout') {
				console.log('Request Time out.');
			} else {
				console.log('Unknow Error.\n' + x.responseText);
			}

		}
	});
	
	
	
	
	
}

function showAnswer()
{
	$("#answer").text($("#hiddenAnswer").text());
	$("#showAnswerBtn").hide();

	$("#RateBtn").show();
	$("#ratingOnAnswerPannel").show();
	
	
	$("#player").children().remove();

	
	getVoiceOutput();
}


function myAnswerIs(ratting) {

countOfTry ++;	

$("#countOfTry").text(countOfTry);

	
if(ratting = 1)	
{
	
	console.log("TIPOVAL JSI SPRAVNE");		
	console.log("POCET OTAZEK PRED ODEJMUTIM JE: " +sentencesForExam.length);	
	sentencesForExam.splice(numberOFSentence,1);
	console.log("OTAZKA CISLO: " +numberOFSentence+ " ODEBRANA");
	console.log("POCET OTAZEK PO ODEJMUTI JE: " +sentencesForExam.length);
	
	countOfGreatAnswers ++;
	countOfSentences = sentencesForExam.length - 1;
	randomSentence = parseInt(Math.random()*countOfSentences);
	getAverage();
	getRandomQuestion(randomSentence);
	
	if(countOfSentences==0)
	{
		
		showMyScore();
		
	}
}


if(ratting = 2)
{
	console.log("TIPOVAL JSI SPRAVNE TAK NAPUL");		
	countOfMediumAnswers ++;
	countOfSentences = sentencesForExam.length - 1;
	randomSentence = parseInt(Math.random()*countOfSentences);
	
	getRandomQuestion(randomSentence);
	getAverage();
	if(countOfSentences==0)
	{
		showMyScore();
	}
}



if(ratting = 3)
{
	console.log("TIPOVAL JSI PROSTE UPLNE BLBE");
	countOfPoorAnswers ++;
	countOfSentences = sentencesForExam.length - 1;
	randomSentence = parseInt(Math.random()*countOfSentences);
	
	getRandomQuestion(randomSentence);
	getAverage();
	if(countOfSentences==0)
	{
		showMyScore();
	}
}


}



function translateIt(translateTo,textToTranslate)
{

	//TRANSLATE 
	jQuery.ajax({
		url : "api/users/translate",
		type : "GET",
		data : {
			text : textToTranslate,
			translateto : translateTo
		},
		success : function(result) {
			//console.log('PARAMS TO TRANSLATE SENT');
			//console.log(result);
			objectResult = jQuery.parseJSON(result);
			//console.log(objectResult.status);

			//console.log('STATUS JE ' + objectResult.status);

			if (objectResult.status == "false") {

				console.log("PREKLAD SE NAZDARIL");

				$("#infoMessMyThemes").show();
				$("#infoMessMyThemes h1").text(
						text['text_se_nepodarilo_prelozit']);

			}

			if (objectResult.status == "success") {
			 //console.log('PRELOZENY TEXT: ' + objectResult.translatedText);
			
			
				return objectResult.translatedText;
		
			}
			
		},
		// IF HTTP RESULT 400 || 404
		error : function(x, e) {

			if (x.status == 0) {
				console.log('You are offline!!\n Please Check Your Network.');
			} else if (x.status == 404) {
				console.log('Requested URL not found.');
			} else if (x.status == 500) {
				console.log('Internel Server Error');
			} else if (e == 'parsererror') {
				console.log('Error.\nParsing JSON Request failed.');
			} else if (e == 'timeout') {
				console.log('Request Time out.');
			} else {
				console.log('Unknow Error.\n' + x.responseText);
			}

		}
	});
	//END 
	
}


function randomExam() {

	jQuery
			.ajax({
				url : "api/users/getMyThemes?id="
						+ localStorage.getItem("user_id") + "",
				type : "GET",
				success : function(result) {
					console.log('PARAMS getMyThemes SENT');
					objectResult = jQuery.parseJSON(result);
					console.log(objectResult.status);

					if (objectResult.status == "no_files") {

						console.log("UZIVATEL NEMA NAHRAN ZADNY SOUBOR");

						$("#infoMessMyThemes").show();
						$("#infoMessMyThemes h1").text(
								text['nenalezeny_zadne_soubory']);
						$("#setTranslateLang").show();
						$("#setTranslateLang").text(text['nahrat']);

					}

					if (objectResult.status == "files_sucess") {

						console.log("UZIVATEL MA NEJAKE SOUBORY, VYPISUJI");

						listOfThemes = [];

						listOfThemes = objectResult.files.split(',');
						//Remove last item
						listOfThemes.pop();
						
						console.log("SEZNAM TEMAT PRP RANDOM :"+listOfThemes);
						
						var countOfThemes = listOfThemes.length;
						var randomTheme = parseInt(Math.random()*countOfThemes);
						var unSplittedNameOfTheme = listOfThemes[randomTheme];
						var nameOfTheme	= unSplittedNameOfTheme.split(';');
						
						console.log("POKOUSIM SE NACIST NAHDONE VYBRANY SOUBOR :"+nameOfTheme);
						
						typeOfUsingTheFile = "exam";
						
						
						fetchSentencesToArray(nameOfTheme[0]);

					}

				},
				// IF HTTP RESULT 400 || 404
				error : function(x, e) {

					if (x.status == 0) {
						console
								.log('You are offline!!\n Please Check Your Network.');
					} else if (x.status == 404) {
						console.log('Requested URL not found.');
					} else if (x.status == 500) {
						console.log('Internel Server Error');
					} else if (e == 'parsererror') {
						console.log('Error.\nParsing JSON Request failed.');
					} else if (e == 'timeout') {
						console.log('Request Time out.');
					} else {
						console.log('Unknow Error.\n' + x.responseText);
					}

				}
			});

};


function showMyScore()
{
	$('.playingSpace').hide();
	$('#myScore').show();
}