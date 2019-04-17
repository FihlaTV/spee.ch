import logger from 'winston';
import db from 'server/models';

const updateBlockedList = (req, res) => {
  db.Blocked.refreshTable()
    .then(data => {
      logger.info('finished updating blocked content list');
      res.status(200).json({
        success: true,
        data,
      });
    })
    .catch(error => {
      logger.error(error);
      res.status(500).json({
        success: false,
        error,
      });
    });
};

export default updateBlockedList;
