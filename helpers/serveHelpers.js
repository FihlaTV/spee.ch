const logger = require('winston');
const SERVE = 'SERVE';
const SHOW = 'SHOW';
const SHOWLITE = 'SHOWLITE';
// const { postToStats, sendGoogleAnalytics } = require('../controllers/statsController.js');

function createOpenGraphInfo ({ claimId, name, fileExt }) {
  return {
    embedUrl     : `https://spee.ch/embed/${claimId}/${name}`,
    showUrl      : `https://spee.ch/${claimId}/${name}`,
    source       : `https://spee.ch/${claimId}/${name}.${fileExt}`,
    directFileUrl: `https://spee.ch/${claimId}/${name}.${fileExt}`,
  };
}

module.exports = {
  serveOrShowAsset (method, fileInfo, claimInfo, shortId, res) {
    // add file extension to the file info
    claimInfo['fileExt'] = fileInfo.fileName.substring(fileInfo.fileName.lastIndexOf('.') + 1);
      // serve or show
    switch (method) {
      case SERVE:
        module.exports.serveFile(fileInfo, claimInfo, shortId, res);
        return fileInfo;
      case SHOWLITE:
        module.exports.showFileLite(fileInfo, claimInfo, shortId, res);
        return fileInfo;
      case SHOW:
        module.exports.showFile(fileInfo, claimInfo, shortId, res);
        return fileInfo;
      default:
        logger.error('I did not recognize that method');
        break;
    }
  },
  serveFile ({ filePath }, { claimId, name, contentType }, shortId, res) {
    logger.verbose(`serving ${name}#${claimId}`);
    // set response options
    const headerContentType = contentType || 'image/jpeg';
    const options = {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Content-Type'          : headerContentType,
      },
    };
    // send the file
    if (filePath) {
      res.status(200).sendFile(filePath, options);
    } else {
      // 'get' the file
      // send the file
      res.status(307).redirect(`/api/get/${name}/${claimId}`);
    }
  },
  showFile (fileInfo, claimInfo, shortId, res) {
    const openGraphInfo = createOpenGraphInfo(claimInfo);
    res.status(200).render('show', { layout: 'show', claimInfo, shortId, openGraphInfo });
  },
  showFileLite (fileInfo, claimInfo, shortId, res) {
    const openGraphInfo = createOpenGraphInfo(claimInfo);
    res.status(200).render('showLite', { layout: 'showlite', claimInfo, shortId, openGraphInfo });
  },
};
