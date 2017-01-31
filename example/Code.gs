//published library is: 1iijnLwSGB7zyfzXEsVl0khN14PtWZ1Wlln7-zneslr2XxomjuOZbogyo

function getFiles() {  
  
  //DriveApp.getRootFolder(); Added to force Drive scope in project
  
  Drive.setTokenService(function(){return ScriptApp.getOAuthToken()})
  var files = Drive.filesList({q:"name contains 'TEST'"});
  Logger.log(files)
}


