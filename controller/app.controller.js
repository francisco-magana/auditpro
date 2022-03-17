// Importaciones
const fs = require('fs');
const Papa = require('papaparse');
var pdf = require('pdf-creator-node');

// Codigos
const { INFO_GENERAL, PROCESADOR, DISCO_SISTEMA } = require('../utils/codes');

// Objeto controlador
let controller = {};

/**
 * @description Parsea un objeto json a un arreglo de arreglos con la informacion requerida
 * @param {string} filepath  La ruta del archivo a cargar
 * @returns {Array} Array de strings con los datos del CSV
 */
controller.getArrayFromCSV = (csvString) => {
        // let csvString = fs.readFileSync(filepath).toString();

        let parsed = Papa.parse(csvString, {
                header: false,
                dynamicTyping: true,
        });

        return parsed;
};

/**
 * @description Funcion que retorna las caracteristicas del equipo con la informacion dada
 * @param {object} data El objeto desestrucuturado con la informacion del CSV a JSON
 */
controller.analize = ({ data }) => {
        const info = {
                general: {
                        equipo: '',
                        SO: '',
                        fabricante: '',
                        RAM: '',
                        usuario: '',
                        almacenamiento: '',
                },
                procesador: {
                        numeroProcesadores: 0,
                        procesador: '',
                        fabricante: '',
                },
                discoC: {
                        almacenamientoTotal: '',
                        almacenamientoDisponible: '',
                        almacenamientoOcupado: '',
                        porcentajeLlenado: '',
                        tipo: '',
                        formato: '',
                },
        };

        // Obtener datos de la info general
        let infoGeneral = data.find((array) => array[0] === INFO_GENERAL);
        info.general.equipo = infoGeneral[2];
        info.general.SO = infoGeneral[7];
        info.general.RAM = infoGeneral[14];
        info.general.usuario = infoGeneral[18];
        info.general.fabricante = infoGeneral[17];
        info.general.almacenamiento = infoGeneral[15];

        // Obtener datos de la info del procesador
        let infoProcesador = data.filter(
                (array) => array[0] === PROCESADOR && array[2] === 'Procesadores'
        );
        let procesadorInfo = infoProcesador[0];
        info.procesador.numeroProcesadores = infoProcesador.length;
        info.procesador.fabricante = procesadorInfo[5];
        info.procesador.procesador = procesadorInfo[3];

        // Obtener datos de disco del sistema
        let infoStorage = data.find((array) => array[0] === DISCO_SISTEMA);
        info.discoC.almacenamientoDisponible = infoStorage[6];
        info.discoC.almacenamientoOcupado = infoStorage[5];
        info.discoC.almacenamientoTotal = infoStorage[7];
        info.discoC.formato = infoStorage[9];
        info.discoC.porcentajeLlenado = infoStorage[4];
        info.discoC.tipo = infoStorage[8];

        // Retornar informacion general del equipo
        console.log(info);
        return info;
};

controller.generarDictamen = (info) => {
        let dictamen = {
                ram: 0,
                procesador: 0,
                almacenamientoTotal: 0,
                almacenamientoLibre: 0,
                numeroProcesadores: 0,
        };

        let recomendaciones = [];

        let resultado = 'INDEFINIDO';

        // Calificar la cantidad de memoria RAM que tiene el equipo
        let totalRAMinMB = parseInt(info.general.RAM.replace('MB', ''));
        const MEGAS_GIGA = 1024;
        if (totalRAMinMB >= MEGAS_GIGA * 1 && totalRAMinMB <= MEGAS_GIGA * 4)
                dictamen.ram = 1;
        else if (totalRAMinMB > MEGAS_GIGA * 4 && totalRAMinMB <= MEGAS_GIGA * 8)
                dictamen.ram = 2;
        else if (totalRAMinMB > MEGAS_GIGA * 8 && totalRAMinMB <= MEGAS_GIGA * 12)
                dictamen.ram = 3;
        else if (totalRAMinMB > MEGAS_GIGA * 12) dictamen.ram = 5;
        else if (totalRAMinMB < MEGAS_GIGA * 1) dictamen.ram = 0;

        // Calificar la cantidad de almacenamiento total
        let totalStorageInGB = parseFloat(
                info.general.almacenamiento.replace('GB', '')
        );
        if (totalStorageInGB <= 128) dictamen.almacenamientoTotal = 1;
        else if (totalStorageInGB > 128 && totalStorageInGB <= 256)
                dictamen.almacenamientoTotal = 2;
        else if (totalStorageInGB > 256 && totalStorageInGB <= 512)
                dictamen.almacenamientoTotal = 3;
        else if (totalStorageInGB > 512 && totalStorageInGB <= 1024)
                dictamen.almacenamientoTotal = 4;
        else if (totalStorageInGB > 1024) dictamen.almacenamientoTotal = 5;

        // Calificar la cantidad de almacenamiento disponible
        let storageUsed = parseInt(info.discoC.porcentajeLlenado.replace('%', ''));
        if (storageUsed === 100) dictamen.almacenamientoLibre = 0;
        else if (storageUsed < 100 && storageUsed >= 75)
                dictamen.almacenamientoLibre = 1;
        else if (storageUsed < 75 && storageUsed >= 50)
                dictamen.almacenamientoLibre = 2;
        else if (storageUsed < 50 && storageUsed >= 25)
                dictamen.almacenamientoLibre = 3;
        else if (storageUsed < 25 && storageUsed >= 10)
                dictamen.almacenamientoLibre = 4;
        else if (storageUsed < 10 && storageUsed >= 0)
                dictamen.almacenamientoLibre = 5;

        // Calificar el numero de procesadores
        let numProcesadores = info.procesador.numeroProcesadores;
        if (numProcesadores == 1) dictamen.numeroProcesadores = 1;
        else if (numProcesadores > 1 && numProcesadores <= 2)
                dictamen.numeroProcesadores = 2;
        else if (numProcesadores > 2 && numProcesadores <= 4)
                dictamen.numeroProcesadores = 3;
        else if (numProcesadores > 4 && numProcesadores <= 8)
                dictamen.numeroProcesadores = 4;
        else if (numProcesadores > 8) dictamen.numeroProcesadores = 5;

        let sumatoriaTotal =
                dictamen.almacenamientoLibre +
                dictamen.almacenamientoTotal +
                dictamen.numeroProcesadores +
                dictamen.ram;
        if (sumatoriaTotal === 20) resultado = 'EXCELENTE';
        else if (sumatoriaTotal < 20 && sumatoriaTotal >= 15) resultado = 'BUENO';
        else if (sumatoriaTotal < 15 && sumatoriaTotal >= 10) resultado = 'REGULAR';
        else if (sumatoriaTotal < 10) resultado = 'MALO';

        // Emitir recomendaciones
        if (dictamen.almacenamientoLibre < 4) {
                recomendaciones.push({
                        data: 'Debido al espacio disponible en su equipo, se recomienda liberar espacio.',
                });
        }

        if (dictamen.almacenamientoTotal < 4) {
                recomendaciones.push({
                        data: 'Debido al espacio disponible en su equipo, recomendamos expandir el disco duro del SO a uno de mayor tamaño',
                });
        }

        if (dictamen.ram < 3) {
                recomendaciones.push({
                        data: 'Es recomendable aumentar la memoria RAM de su equipo para un mejor funcionamiento',
                });
        }

        console.log(recomendaciones);

        return {
                resultado,
                dictamen,
                puntos: sumatoriaTotal,
                recomendaciones,
        };
};

controller.generarPDF = async(dictamen, info) => {
        let html = fs.readFileSync('controller/template.html', 'utf8');

        let options = {
                format: 'A3',
                orientation: 'portrait',
                border: '10mm',
                header: {
                        height: '45mm',
                        contents:
                                '<div style="text-align: center;">Universidad Autonoma de Chiapas<br>Francisco Javier Magaña Palomeque<br>Carlos Aarón Lázaro Patricio</div>',
                },
                footer: {
                        height: '28mm',
                        contents: {
                                first: 'DICTAMEN',
                                2: 'DICTAMEN', // Any page number is working. 1-based index
                                default:
                                        '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                                last: 'Last Page',
                        },
                },
        };

        let document = {
                html: html,
                data: {
                        info,
                        dictamen,
                        date: new Date().toISOString().substring(0, 10),
                },
                path: './public/pdfs/output.pdf',
                type: '',
        };

        await pdf.create(document, options);
};

module.exports = controller;