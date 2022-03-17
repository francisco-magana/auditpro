import styles from '../styles/index.module.css';

import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Dragger } = Upload;

const IndexComponent = () => {
	const descargar = () => {
		let a = document.createElement('a');
		a.href = '/pdfs/output.pdf';
		a.target = '_blank';
		a.click();
	};

	const getResult = async (csvCode) => {
		console.log(csvCode);
		await axios.post('/api/generar/', { data: csvCode });
		descargar();
	};

	const props = {
		name: 'file',
		accept: '.csv',
		multiple: false,
		maxCount: 1,
		onChange: (info) => {
			console.log({ info });
			if (info.file.status !== 'uploading') {
				let reader = new FileReader();
				reader.onload = (e) => {
					getResult(e.target.result);
				};
				reader.readAsText(info.file.originFileObj);
			}

			if (info.file.status === 'done') {
				message.success(
					`${info.file.name} Cargado correctamente. Estamos Generando tus resultados`
				);
			} else if (info.file.status === 'error') {
				message.error(
					`${info.file.name} La subida del archivo ha fallado.`
				);
			}
		},
		onDrop(e) {
			console.log('Dropped files', e.dataTransfer.files);
		},
	};

	return (
		<>
			<div className={styles.header}>MY AUDIT PRO</div>
			<div className={styles.center}>
				<Dragger {...props}>
					<p className="ant-upload-drag-icon">
						<InboxOutlined />
					</p>
					<p className="ant-upload-text">
						Click or drag file to this area to upload
					</p>
					<p className="ant-upload-hint">
						Support for a single or bulk upload. Strictly prohibit
						from uploading company data or other band files
					</p>
				</Dragger>
			</div>
		</>
	);
};

export default IndexComponent;
