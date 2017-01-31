//published library is: 1iijnLwSGB7zyfzXEsVl0khN14PtWZ1Wlln7-zneslr2XxomjuOZbogyo
//Don't forget to enable the Drive API in the project API console

function getFiles() {  
  
  //DriveApp.getRootFolder(); Added to force Drive scope in project
  
  Drive.setTokenService(function(){return ScriptApp.getOAuthToken()})
  var files = Drive.filesList({q:"name contains 'TEST'"});
  Logger.log(files)
}


