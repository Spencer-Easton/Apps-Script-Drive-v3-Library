
/**
* Google Apps Script Library for the drive API
* 
* Documentation can be found: 
* https://developers.google.com/drive/
* 
* OAuth2 Scopes
* https://www.googleapis.com/auth/drive
* https://www.googleapis.com/auth/drive.appdata
* https://www.googleapis.com/auth/drive.file
* https://www.googleapis.com/auth/drive.metadata
* https://www.googleapis.com/auth/drive.metadata.readonly
* https://www.googleapis.com/auth/drive.photos.readonly
* https://www.googleapis.com/auth/drive.readonly
* https://www.googleapis.com/auth/drive.scripts
*/

var BASEURL_="https://www.googleapis.com/drive/v3/";
var tokenService_;

/*
* Stores the function passed that is invoked to get a OAuth2 token;
* @param {function} service The function used to get the OAuth2 token;
*
*/
function setTokenService(service){
  tokenService_ = service;
}

/*
* Returns an OAuth2 token from your TokenService as a test
* @return {string} An OAuth2 token
*
*/
function testTokenService(){
 return tokenService_();
}

/**
 * Performs a Fetch
 * @param {string} url The endpoint for the URL with parameters
 * @param {Object.<string, string>} options Options to override default fetch options
 * @returns {Object.<string,string>} the fetch results
 * @private
 */
function CALL_(path,options){
  var fetchOptions = {method:"",muteHttpExceptions:true, contentType:"application/json", headers:{Authorization:"Bearer "+tokenService_()}}
  var url = BASEURL_ + path;
  
  for(option in options){
    fetchOptions[option] = options[option];
  }
  
  var response = UrlFetchApp.fetch(url, fetchOptions)
  if(response.getResponseCode() != 200){
    throw new Error(response.getContentText())
  }else{
    return JSON.parse(response.getContentText());
  }
}

/**
 * Performs a Fetch and accumulation using pageToken parameter of the returned results
 * @param {string} url The endpoint for the URL with parameters
 * @param {Object.<string, string>} options Options to override default fetch options
 * @param {string} returnParamPath The path of the parameter to be accumulated
 * @returns {Array.Object.<string,string>} An array of objects
 * @private
 */
function CALLPAGE_(path,options, returnParamPath){
  var fetchOptions = {method:"",muteHttpExceptions:true, contentType:"application/json", headers:{Authorization:"Bearer "+tokenService_()}}
  for(option in options){
    fetchOptions[option] = options[option];
  }
  var url = BASEURL_ + path;  
  var returnArray = [];
  var nextPageToken;
  do{
    if(nextPageToken){
      url += "pageToken=" + nextPageToken;
    }
    var results = UrlFetchApp.fetch(url, fetchOptions);
    if(results.getResponseCode() != 200){
      throw new Error(results.getContentText());
    }else{
      var resp = JSON.parse(results.getContentText())
      nextPageToken = resp.nextPageToken;
      returnArray  = returnArray.concat(resp[returnParamPath])
    }
  }while(nextPageToken);
  return returnArray;
}

/**
 * Builds a complete URL from a base URL and a map of URL parameters. Written by Eric Koleda in the OAuth2 library
 * @param {string} url The base URL.
 * @param {Object.<string, string>} params The URL parameters and values.
 * @returns {string} The complete URL.
 * @private
 */
function buildUrl_(url, params) {
  var params = params || {}; //allow for NULL options
  var paramString = Object.keys(params).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + paramString;  
}

/**
* Gets information about the user, the user's Drive, and system capabilities.
*
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned AboutResource object
*/
function aboutGet(options){
  var path = buildUrl_("about",options);
  var callOptions = {method:"GET"};
  var AboutResource = CALL_(path,callOptions);
  return AboutResource;
}

/**
* Gets the starting pageToken for listing future changes.
*
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned StartPageTokenResource object
*/
function changesGetStartPageToken(options){
  var path = buildUrl_("changes/startPageToken",options);
  var callOptions = {method:"GET"};
  var StartPageTokenResource = CALL_(path,callOptions);
  return StartPageTokenResource;
}

/**
* Lists changes for a user.
*
* @param {string} pageToken The token for continuing a previous list request on the next page. This should be set to the value of 'nextPageToken' from the previous response or to the response from the getStartPageToken method.
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned ChangeListResource object
*/
function changesList(pageToken,options){
  var path = buildUrl_("changes",options);
  var callOptions = {method:"GET"};
  var ChangeListItems = CALLPAGE_(path,callOptions,"items");
  return ChangeListItems;
}

/**
* Subscribes to changes for a user.
*
* @param {string} pageToken The token for continuing a previous list request on the next page. This should be set to the value of 'nextPageToken' from the previous response or to the response from the getStartPageToken method.
* @param {object} ChannelResource An object containing the ChannelResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned ChannelResource object
*/
function changesWatch(pageToken,ChannelResource,options){
  var path = buildUrl_("changes/watch",options);
  var callOptions = {method:"POST",payload:JSON.stringify(ChannelResource)};
  var ChannelItems = CALLPAGE_(path,callOptions,"items");
  return ChannelItems;
}

/**
* Stop watching resources through this channel
*
* @param {object} ChannelResource An object containing the ChannelResource for this method
* @param {object} options Keypair of all optional parameters for this call
*/
function channelsStop(ChannelResource,options){
  var path = buildUrl_("channels/stop",options);
  var callOptions = {method:"POST",payload:JSON.stringify(ChannelResource)};
  var removeResource = CALL_(path,callOptions);
  return removeResource;
}

/**
* Creates a new comment on a file.
*
* @param {string} fileId The ID of the file.
* @param {object} CommentResource An object containing the CommentResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned CommentResource object
*/
function commentsCreate(fileId,CommentResource,options){
  var path = buildUrl_("files/"+fileId+"/comments",options);
  var callOptions = {method:"POST",payload:JSON.stringify(CommentResource)};
  var CommentResource = CALL_(path,callOptions);
  return CommentResource;
}

/**
* Deletes a comment.
*
* @param {string} fileId The ID of the file.
* @param {string} commentId The ID of the comment.
* @param {object} options Keypair of all optional parameters for this call
*/
function commentsDelete(fileId,commentId,options){
  var path = buildUrl_("files/"+fileId+"/comments/"+commentId,options);
  var callOptions = {method:"DELETE"};
  var removeResource = CALL_(path,callOptions);
  return removeResource;
}

/**
* Gets a comment by ID.
*
* @param {string} fileId The ID of the file.
* @param {string} commentId The ID of the comment.
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned CommentResource object
*/
function commentsGet(fileId,commentId,options){
  var path = buildUrl_("files/"+fileId+"/comments/"+commentId,options);
  var callOptions = {method:"GET"};
  var CommentResource = CALL_(path,callOptions);
  return CommentResource;
}

/**
* Lists a file's comments.
*
* @param {string} fileId The ID of the file.
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned CommentListResource object
*/
function commentsList(fileId,options){
  var path = buildUrl_("files/"+fileId+"/comments",options);
  var callOptions = {method:"GET"};
  var CommentListItems = CALLPAGE_(path,callOptions,"items");
  return CommentListItems;
}

/**
* Updates a comment with patch semantics.
*
* @param {string} fileId The ID of the file.
* @param {string} commentId The ID of the comment.
* @param {object} CommentResource An object containing the CommentResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned CommentResource object
*/
function commentsUpdate(fileId,commentId,CommentResource,options){
  var path = buildUrl_("files/"+fileId+"/comments/"+commentId,options);
  var callOptions = {method:"PATCH",payload:JSON.stringify(CommentResource)};
  var CommentResource = CALL_(path,callOptions);
  return CommentResource;
}

/**
* Creates a copy of a file and applies any requested updates with patch semantics.
*
* @param {string} fileId The ID of the file.
* @param {object} FileResource An object containing the FileResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned FileResource object
*/
function filesCopy(fileId,FileResource,options){
  var path = buildUrl_("files/"+fileId+"/copy",options);
  var callOptions = {method:"POST",payload:JSON.stringify(FileResource)};
  var FileResource = CALL_(path,callOptions);
  return FileResource;
}

/**
* Creates a new file.
*
* @param {object} FileResource An object containing the FileResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned FileResource object
*/
function filesCreate(FileResource,options){
  var path = buildUrl_("files",options);
  var callOptions = {method:"POST",payload:JSON.stringify(FileResource)};
  var FileResource = CALL_(path,callOptions);
  return FileResource;
}

/**
* Permanently deletes a file owned by the user without moving it to the trash. If the target is a folder, all descendants owned by the user are also deleted.
*
* @param {string} fileId The ID of the file.
* @param {object} options Keypair of all optional parameters for this call
*/
function filesDelete(fileId,options){
  var path = buildUrl_("files/"+fileId,options);
  var callOptions = {method:"DELETE"};
  var removeResource = CALL_(path,callOptions);
  return removeResource;
}

/**
* Permanently deletes all of the user's trashed files.
*
* @param {object} options Keypair of all optional parameters for this call
*/
function filesEmptyTrash(options){
  var path = buildUrl_("files/trash",options);
  var callOptions = {method:"DELETE"};
  var removeResource = CALL_(path,callOptions);
  return removeResource;
}

/**
* Exports a Google Doc to the requested MIME type and returns the exported content.
*
* @param {string} fileId The ID of the file.
* @param {string} mimeType The MIME type of the format requested for this export.
* @param {object} options Keypair of all optional parameters for this call
*/
function filesExport(fileId,mimeType,options){
  var path = buildUrl_("files/"+fileId+"/export",options);
  var callOptions = {method:"GET"};
  var removeResource = CALL_(path,callOptions);
  return removeResource;
}

/**
* Generates a set of file IDs which can be provided in create requests.
*
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned GeneratedIdsResource object
*/
function filesGenerateIds(options){
  var path = buildUrl_("files/generateIds",options);
  var callOptions = {method:"GET"};
  var GeneratedIdsResource = CALL_(path,callOptions);
  return GeneratedIdsResource;
}

/**
* Gets a file's metadata or content by ID.
*
* @param {string} fileId The ID of the file.
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned FileResource object
*/
function filesGet(fileId,options){
  var path = buildUrl_("files/"+fileId,options);
  var callOptions = {method:"GET"};
  var FileResource = CALL_(path,callOptions);
  return FileResource;
}

/**
* Lists or searches files.
*
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned FileListResource object
*/
function filesList(options){
  var path = buildUrl_("files",options);
  var callOptions = {method:"GET"};
  var FileListItems = CALLPAGE_(path,callOptions,"items");
  return FileListItems;
}

/**
* Updates a file's metadata and/or content with patch semantics.
*
* @param {string} fileId The ID of the file.
* @param {object} FileResource An object containing the FileResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned FileResource object
*/
function filesUpdate(fileId,FileResource,options){
  var path = buildUrl_("files/"+fileId,options);
  var callOptions = {method:"PATCH",payload:JSON.stringify(FileResource)};
  var FileResource = CALL_(path,callOptions);
  return FileResource;
}

/**
* Subscribes to changes to a file
*
* @param {string} fileId The ID of the file.
* @param {object} ChannelResource An object containing the ChannelResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned ChannelResource object
*/
function filesWatch(fileId,ChannelResource,options){
  var path = buildUrl_("files/"+fileId+"/watch",options);
  var callOptions = {method:"POST",payload:JSON.stringify(ChannelResource)};
  var ChannelResource = CALL_(path,callOptions);
  return ChannelResource;
}

/**
* Creates a permission for a file.
*
* @param {string} fileId The ID of the file.
* @param {object} PermissionResource An object containing the PermissionResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned PermissionResource object
*/
function permissionsCreate(fileId,PermissionResource,options){
  var path = buildUrl_("files/"+fileId+"/permissions",options);
  var callOptions = {method:"POST",payload:JSON.stringify(PermissionResource)};
  var PermissionResource = CALL_(path,callOptions);
  return PermissionResource;
}

/**
* Deletes a permission.
*
* @param {string} fileId The ID of the file.
* @param {string} permissionId The ID of the permission.
* @param {object} options Keypair of all optional parameters for this call
*/
function permissionsDelete(fileId,permissionId,options){
  var path = buildUrl_("files/"+fileId+"/permissions/"+permissionId,options);
  var callOptions = {method:"DELETE"};
  var removeResource = CALL_(path,callOptions);
  return removeResource;
}

/**
* Gets a permission by ID.
*
* @param {string} fileId The ID of the file.
* @param {string} permissionId The ID of the permission.
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned PermissionResource object
*/
function permissionsGet(fileId,permissionId,options){
  var path = buildUrl_("files/"+fileId+"/permissions/"+permissionId,options);
  var callOptions = {method:"GET"};
  var PermissionResource = CALL_(path,callOptions);
  return PermissionResource;
}

/**
* Lists a file's permissions.
*
* @param {string} fileId The ID of the file.
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned PermissionListResource object
*/
function permissionsList(fileId,options){
  var path = buildUrl_("files/"+fileId+"/permissions",options);
  var callOptions = {method:"GET"};
  var PermissionListResource = CALL_(path,callOptions);
  return PermissionListResource;
}

/**
* Updates a permission with patch semantics.
*
* @param {string} fileId The ID of the file.
* @param {string} permissionId The ID of the permission.
* @param {object} PermissionResource An object containing the PermissionResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned PermissionResource object
*/
function permissionsUpdate(fileId,permissionId,PermissionResource,options){
  var path = buildUrl_("files/"+fileId+"/permissions/"+permissionId,options);
  var callOptions = {method:"PATCH",payload:JSON.stringify(PermissionResource)};
  var PermissionResource = CALL_(path,callOptions);
  return PermissionResource;
}

/**
* Creates a new reply to a comment.
*
* @param {string} fileId The ID of the file.
* @param {string} commentId The ID of the comment.
* @param {object} ReplyResource An object containing the ReplyResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned ReplyResource object
*/
function repliesCreate(fileId,commentId,ReplyResource,options){
  var path = buildUrl_("files/"+fileId+"/comments/"+commentId+"/replies",options);
  var callOptions = {method:"POST",payload:JSON.stringify(ReplyResource)};
  var ReplyResource = CALL_(path,callOptions);
  return ReplyResource;
}

/**
* Deletes a reply.
*
* @param {string} fileId The ID of the file.
* @param {string} commentId The ID of the comment.
* @param {string} replyId The ID of the reply.
* @param {object} options Keypair of all optional parameters for this call
*/
function repliesDelete(fileId,commentId,replyId,options){
  var path = buildUrl_("files/"+fileId+"/comments/"+commentId+"/replies/"+replyId,options);
  var callOptions = {method:"DELETE"};
  var removeResource = CALL_(path,callOptions);
  return removeResource;
}

/**
* Gets a reply by ID.
*
* @param {string} fileId The ID of the file.
* @param {string} commentId The ID of the comment.
* @param {string} replyId The ID of the reply.
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned ReplyResource object
*/
function repliesGet(fileId,commentId,replyId,options){
  var path = buildUrl_("files/"+fileId+"/comments/"+commentId+"/replies/"+replyId,options);
  var callOptions = {method:"GET"};
  var ReplyResource = CALL_(path,callOptions);
  return ReplyResource;
}

/**
* Lists a comment's replies.
*
* @param {string} fileId The ID of the file.
* @param {string} commentId The ID of the comment.
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned ReplyListResource object
*/
function repliesList(fileId,commentId,options){
  var path = buildUrl_("files/"+fileId+"/comments/"+commentId+"/replies",options);
  var callOptions = {method:"GET"};
  var ReplyListItems = CALLPAGE_(path,callOptions,"items");
  return ReplyListItems;
}

/**
* Updates a reply with patch semantics.
*
* @param {string} fileId The ID of the file.
* @param {string} commentId The ID of the comment.
* @param {string} replyId The ID of the reply.
* @param {object} ReplyResource An object containing the ReplyResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned ReplyResource object
*/
function repliesUpdate(fileId,commentId,replyId,ReplyResource,options){
  var path = buildUrl_("files/"+fileId+"/comments/"+commentId+"/replies/"+replyId,options);
  var callOptions = {method:"PATCH",payload:JSON.stringify(ReplyResource)};
  var ReplyResource = CALL_(path,callOptions);
  return ReplyResource;
}

/**
* Permanently deletes a revision. This method is only applicable to files with binary content in Drive.
*
* @param {string} fileId The ID of the file.
* @param {string} revisionId The ID of the revision.
* @param {object} options Keypair of all optional parameters for this call
*/
function revisionsDelete(fileId,revisionId,options){
  var path = buildUrl_("files/"+fileId+"/revisions/"+revisionId,options);
  var callOptions = {method:"DELETE"};
  var removeResource = CALL_(path,callOptions);
  return removeResource;
}

/**
* Gets a revision's metadata or content by ID.
*
* @param {string} fileId The ID of the file.
* @param {string} revisionId The ID of the revision.
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned RevisionResource object
*/
function revisionsGet(fileId,revisionId,options){
  var path = buildUrl_("files/"+fileId+"/revisions/"+revisionId,options);
  var callOptions = {method:"GET"};
  var RevisionResource = CALL_(path,callOptions);
  return RevisionResource;
}

/**
* Lists a file's revisions.
*
* @param {string} fileId The ID of the file.
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned RevisionListResource object
*/
function revisionsList(fileId,options){
  var path = buildUrl_("files/"+fileId+"/revisions",options);
  var callOptions = {method:"GET"};
  var RevisionListResource = CALL_(path,callOptions);
  return RevisionListResource;
}

/**
* Updates a revision with patch semantics.
*
* @param {string} fileId The ID of the file.
* @param {string} revisionId The ID of the revision.
* @param {object} RevisionResource An object containing the RevisionResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned RevisionResource object
*/
function revisionsUpdate(fileId,revisionId,RevisionResource,options){
  var path = buildUrl_("files/"+fileId+"/revisions/"+revisionId,options);
  var callOptions = {method:"PATCH",payload:JSON.stringify(RevisionResource)};
  var RevisionResource = CALL_(path,callOptions);
  return RevisionResource;
}
