import express from 'express';
import getColumns from '../control/Path_Control/FormData/formController.mjs';

const router = express.Router();

router.get('/form', getColumns, (req, res) => {
    res.render('form', { columns: res.locals.columns });
});

export default router;
