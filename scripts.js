const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const urlEntradaCampoalegre = "https://raw.githubusercontent.com/Lucesdata/prueba1/refs/heads/main/hourly_average_1.csv";
const urlSalidaCampoalegre = "https://raw.githubusercontent.com/Lucesdata/ptap-rural-csv/main/campoalegre_valor_caudal_salida2.csv";

// DOM
const ctxInput = document.getElementById('inputChart').getContext('2d');
const ctxOutput = document.getElementById('outputChart').getContext('2d');
const inputCanvas = document.getElementById('inputChart');
const outputCanvas = document.getElementById('outputChart');
const descriptionCard = document.getElementById('description-card');
const plantTitle = document.getElementById('plant-title');
const volverBtn = document.getElementById('volver-btn');
const filtrosDiv = document.getElementById('filtros');
const estadisticasDiv = document.getElementById('estadisticas');
const mesSelect = document.getElementById('mes-select');
const maxEl = document.getElementById('valor-max');
const minEl = document.getElementById('valor-min');
const promEl = document.getElementById('valor-prom');

// Radio buttons para selección de gráfico
const radioEntrada = document.getElementById('ver-entrada');
const radioSalida = document.getElementById('ver-salida');

// Gráficos
const inputChart = new Chart(ctxInput, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Caudal de Entrada (L/s)',
      data: [],
      borderColor: 'blue',
      fill: false
    }]
  },
  options: { responsive: true }
});

const outputChart = new Chart(ctxOutput, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Caudal de Salida (L/s)',
      data: [],
      borderColor: 'green',
      fill: false
    }]
  },
  options: { responsive: true }
});

let campoalegreEntradaData = [];
let campoalegreSalidaData = [];

// Leer CSV
async function cargarDatosCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  const rows = text.trim().split('\n').slice(1);
  return rows.map(row => {
    const [fechaHora, valor] = row.split(',');
    return {
      hora: new Date(fechaHora),
      valor: parseFloat(valor)
    };
  }).filter(d => !isNaN(d.valor));
}

// Mostrar gráfico
function mostrarGrafico(chart, data) {
  chart.data.labels = data.map(d => d.hora.toLocaleString());
  chart.data.datasets[0].data = data.map(d => d.valor);
  chart.update();
}

// Estadísticas combinadas
function mostrarEstadisticas(dataEntrada, dataSalida) {
  if (dataEntrada.length === 0 && dataSalida.length === 0) {
    maxEl.textContent = minEl.textContent = promEl.textContent = '-';
    return;
  }

  const valores = [...dataEntrada, ...dataSalida].map(d => d.valor);
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  const prom = (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2);

  maxEl.textContent = max + ' L/s';
  minEl.textContent = min + ' L/s';
  promEl.textContent = prom + ' L/s';
}

// Mostrar solo un gráfico a la vez
function actualizarGraficoVisible() {
  inputCanvas.style.display = radioEntrada.checked ? 'block' : 'none';
  outputCanvas.style.display = radioSalida.checked ? 'block' : 'none';
}

// Eventos de cambio de selección
radioEntrada.addEventListener('change', actualizarGraficoVisible);
radioSalida.addEventListener('change', actualizarGraficoVisible);

// Filtro por mes
mesSelect.addEventListener('change', () => {
  const mes = parseInt(mesSelect.value);
  if (isNaN(mes)) return;

  const entradaFiltrada = campoalegreEntradaData.filter(d => d.hora.getMonth() === mes);
  const salidaFiltrada = campoalegreSalidaData.filter(d => d.hora.getMonth() === mes);

  mostrarGrafico(inputChart, entradaFiltrada);
  mostrarGrafico(outputChart, salidaFiltrada);
  mostrarEstadisticas(entradaFiltrada, salidaFiltrada);
  actualizarGraficoVisible();
});

// Click en una planta
document.querySelectorAll('#plant-list li').forEach(item => {
  item.addEventListener('click', async () => {
    const plant = item.textContent;
    plantTitle.textContent = `Datos de: ${plant}`;
    inputCanvas.style.display = 'block';
    outputCanvas.style.display = 'block';
    volverBtn.style.display = 'inline-block';
    filtrosDiv.style.display = 'block';
    estadisticasDiv.style.display = 'block';
    descriptionCard.style.display = 'none';
    mesSelect.value = "";
    radioEntrada.checked = true;
    actualizarGraficoVisible();

    if (plant === "Campoalegre") {
      campoalegreEntradaData = await cargarDatosCSV(urlEntradaCampoalegre);
      campoalegreSalidaData = await cargarDatosCSV(urlSalidaCampoalegre);
      mostrarGrafico(inputChart, campoalegreEntradaData);
      mostrarGrafico(outputChart, campoalegreSalidaData);
      mostrarEstadisticas(campoalegreEntradaData, campoalegreSalidaData);
    } else {
      const dummy = Array(12).fill().map(() => Math.floor(Math.random() * 10) + 5);
      const etiquetas = months.map((m, i) => `${m} 2024`);
      inputChart.data.labels = etiquetas;
      inputChart.data.datasets[0].data = dummy;
      inputChart.update();

      outputChart.data.labels = etiquetas;
      outputChart.data.datasets[0].data = dummy.map(v => v - 1);
      outputChart.update();

      filtrosDiv.style.display = 'none';
      estadisticasDiv.style.display = 'none';
    }
  });
});

// Botón volver
volverBtn.addEventListener('click', () => {
  inputCanvas.style.display = 'none';
  outputCanvas.style.display = 'none';
  descriptionCard.style.display = 'flex';
  volverBtn.style.display = 'none';
  filtrosDiv.style.display = 'none';
  estadisticasDiv.style.display = 'none';
  plantTitle.textContent = "Seleccione una planta";
});
