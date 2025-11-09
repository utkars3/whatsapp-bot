// utils/chart.js
// Generates a QuickChart pie chart URL for category-wise expenses

export function getCategoryPieChartUrl(categoryTotals) {
  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const chartConfig = {
    type: 'pie',
    data: {
      labels,
      datasets: [{ data }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' }
      },
      title: {
        display: true,
        text: 'Expenses by Category'
      }
    }
  };
  const encoded = encodeURIComponent(JSON.stringify(chartConfig));
  return `https://quickchart.io/chart?c=${encoded}`;
}
