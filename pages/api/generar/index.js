const controller = require('../../../controller/app.controller');

const handler = async(req, res) => {

    const csv = req.body.data;

    let data = controller.getArrayFromCSV(csv);
    const analisis = controller.analize(data);
    const dictamen = controller.generarDictamen(analisis);
    await controller.generarPDF(dictamen, analisis);

    return res.json(
        {
            ok: true
        }
    )

}

export default handler;