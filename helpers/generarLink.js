
const getDirectLink = (dropboxPreviewUrl)=> {
    return dropboxPreviewUrl.replace(/www\.dropbox\.com\/scl\/fi\//, 'dl.dropboxusercontent.com/s/');
  }
export default getDirectLink;