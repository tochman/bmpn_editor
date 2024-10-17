import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule
} from 'bpmn-js-properties-panel';
import BpmnColorPickerModule from 'bpmn-js-color-picker';

import diagramXML from './newDiagram.bpmn';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('js-drop-zone');
  const canvas = document.getElementById('js-canvas');
  const propertiesPanel = document.getElementById('js-properties-panel');

  if (!container) {
    console.error('Container element with id "js-drop-zone" not found');
    return;
  }

  const modeler = new BpmnModeler({
    container: '#js-canvas',
    keyboard: {
      bindTo: window
    },
    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      BpmnColorPickerModule
    ],
    propertiesPanel: {
      parent: '#js-properties-panel'
    }
  });

  function createNewDiagram() {
    openDiagram(diagramXML);
  }

  async function openDiagram(xml) {
    try {
      await modeler.importXML(xml);
      container.classList.remove('with-error');
      container.classList.remove('with-intro');
      container.classList.add('with-diagram');
      canvas.style.display = 'block';
      propertiesPanel.style.display = 'block';
    } catch (err) {
      container.classList.remove('with-diagram');
      container.classList.add('with-error');

      const errorElement = container.querySelector('.error pre');
      if (errorElement) {
        errorElement.textContent = err.message;
      }

      console.error(err);
    }
  }

  function registerFileDrop(container, callback) {
    function handleFileSelect(e) {
      e.stopPropagation();
      e.preventDefault();

      const files = e.dataTransfer.files;
      const file = files[0];
      const reader = new FileReader();

      reader.onload = function(e) {
        const xml = e.target.result;
        callback(xml);
      };

      reader.readAsText(file);
    }

    function handleDragOver(e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    container.addEventListener('dragover', handleDragOver, false);
    container.addEventListener('drop', handleFileSelect, false);
  }

  // file drag / drop ///////////////////////

  // check file api availability
  if (!window.FileList || !window.FileReader) {
    window.alert(
      'Looks like you use an older browser that does not support drag and drop. ' +
      'Try using Chrome, Firefox or the Internet Explorer > 10.');
  } else {
    registerFileDrop(container, openDiagram);
  }

  // bootstrap diagram functions
  const createDiagramButton = document.getElementById('js-create-diagram');
  if (createDiagramButton) {
    createDiagramButton.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      createNewDiagram();
    });
  } else {
    console.error('Create Diagram button with id "js-create-diagram" not found');
  }

  const downloadLink = document.getElementById('js-download-diagram');
  const downloadSvgLink = document.getElementById('js-download-svg');

  document.querySelectorAll('.buttons a').forEach(button => {
    button.addEventListener('click', (e) => {
      if (!button.classList.contains('active')) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  });

  function setEncoded(link, name, data) {
    if (link) {
      const encodedData = encodeURIComponent(data);
      if (data) {
        link.classList.add('active');
        link.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData);
        link.setAttribute('download', name);
      } else {
        link.classList.remove('active');
      }
    }
  }

  const exportArtifacts = debounce(async function() {
    try {
      const { svg } = await modeler.saveSVG();
      setEncoded(downloadSvgLink, 'diagram.svg', svg);
    } catch (err) {
      console.error('Error happened saving svg: ', err);
      setEncoded(downloadSvgLink, 'diagram.svg', null);
    }

    try {
      const { xml } = await modeler.saveXML({ format: true });
      setEncoded(downloadLink, 'diagram.bpmn', xml);
    } catch (err) {
      console.error('Error happened saving XML: ', err);
      setEncoded(downloadLink, 'diagram.bpmn', null);
    }
  }, 500);

  modeler.on('commandStack.changed', exportArtifacts);

  // Show the intro message by default
  container.classList.add('with-intro');
  canvas.style.display = 'none';
  propertiesPanel.style.display = 'none';
});

// helpers //////////////////////
function debounce(fn, timeout) {
  let timer;
  return function() {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, timeout);
  };
}