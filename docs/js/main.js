/**
 * CrashMetrics Australia — Global Main Controller
 * Handles Data Preloading, Preloader Framed Choreography, Global Tooltip Engine, and Module Coordination
 */

window.AppState = {
  datasets: {},
  activeMeasureS1: 'Hospitalisations',
  activeMeasureS2: 'Hospitalisations',
  activeYearS2: 2021,
  activeMeasureS3: 'Hospitalisations',
  activeStateS3: 'NSW',
  activeYearS4: 2021
};

const tooltipEl = document.getElementById('global-tooltip');

window.showTooltip = function(event, htmlContent) {
  if (!tooltipEl) return;
  tooltipEl.innerHTML = htmlContent;
  tooltipEl.classList.add('visible');
  tooltipEl.setAttribute('aria-hidden', 'false');

  const padding = 16;
  const tooltipRect = tooltipEl.getBoundingClientRect();
  
  let left = event.clientX;
  let top = event.clientY - 14;

  if (left - tooltipRect.width / 2 < padding) {
    left = tooltipRect.width / 2 + padding;
  } else if (left + tooltipRect.width / 2 > window.innerWidth - padding) {
    left = window.innerWidth - tooltipRect.width / 2 - padding;
  }

  if (top - tooltipRect.height < padding) {
    top = event.clientY + 26;
  }

  tooltipEl.style.left = `${left}px`;
  tooltipEl.style.top = `${top}px`;
};

window.hideTooltip = function() {
  if (!tooltipEl) return;
  tooltipEl.classList.remove('visible');
  tooltipEl.setAttribute('aria-hidden', 'true');
};

window.formatNumber = d3.format(",");
window.formatDecimal = d3.format(".2f");

async function initApp() {
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderCounter = document.getElementById('preloader-counter');
  const preloader = document.getElementById('preloader');

  let loadProgress = 3;
  const progressTimer = setInterval(() => {
    if (loadProgress < 88) {
      loadProgress += Math.floor(Math.random() * 9) + 4;
      if (loadProgress > 88) loadProgress = 88;
      if (preloaderBar) preloaderBar.style.width = `${loadProgress}%`;
      if (preloaderCounter) preloaderCounter.textContent = `${loadProgress}%`;
    }
  }, 35);

  try {
    const [
      nationalAnnual,
      nationalRoadUser,
      nationalAge,
      stateAnnual,
      fnAnnual,
      fnRoadUser,
      fnAge
    ] = await Promise.all([
      d3.csv('data/National_annual.csv', d => ({
        Year: +d.Year,
        Hospitalisations: +d.Hospitalisations,
        BedDays: +d.BedDays
      })),
      d3.csv('data/National_roaduser_annual.csv', d => ({
        Year: +d.Year,
        RoadUser: d.RoadUser.trim(),
        Hospitalisations: +d.Hospitalisations,
        BedDays: +d.BedDays
      })),
      d3.csv('data/National_Age_annual.csv', d => ({
        Year: +d.Year,
        AgeGroup: d.AgeGroup.trim(),
        Hospitalisations: +d.Hospitalisations,
        BedDays: +d.BedDays
      })),
      d3.csv('data/State_territory_annual.csv', d => ({
        Year: +d.Year,
        State: d.State.trim(),
        Hospitalisations: +d.Hospitalisations,
        BedDays: +d.BedDays
      })),
      d3.csv('data/FirstNations_annual.csv', d => ({
        Year: +d.Year,
        Hospitalisations: +d.Hospitalisations
      })),
      d3.csv('data/FirstNation_RoadUser_annual.csv', d => ({
        Year: +d.Year,
        RoadUser: d.RoadUser.trim(),
        Hospitalisations: d.Hospitalisations === 'n.p.' ? 'n.p.' : +d.Hospitalisations,
        BedDays: d.BedDays === 'n.p.' ? 'n.p.' : +d.BedDays
      })),
      d3.csv('data/FirstNations_age_annual.csv', d => ({
        Year: +d.Year,
        AgeGroup: d.AgeGroup.trim(),
        Hospitalisations: d.Hospitalisations === 'n.p.' ? 'n.p.' : +d.Hospitalisations,
        BedDays: d.BedDays === 'n.p.' ? 'n.p.' : +d.BedDays
      }))
    ]);

    window.AppState.datasets = {
      nationalAnnual,
      nationalRoadUser,
      nationalAge,
      stateAnnual,
      fnAnnual,
      fnRoadUser,
      fnAge
    };

    clearInterval(progressTimer);
    if (preloaderBar) preloaderBar.style.width = '100%';
    if (preloaderCounter) preloaderCounter.textContent = '100%';

    setTimeout(() => {
      if (preloader) preloader.classList.add('loaded');
    }, 380);

    updateHeroKPIs(nationalAnnual);

    if (typeof initStoryline1 === 'function') initStoryline1(nationalAnnual);
    if (typeof initStoryline2 === 'function') initStoryline2(nationalRoadUser, nationalAge);
    if (typeof initStoryline3 === 'function') initStoryline3(stateAnnual);
    if (typeof initStoryline4 === 'function') initStoryline4(fnAnnual, fnRoadUser, fnAge);

  } catch (err) {
    console.error('Error loading AIHW crash datasets:', err);
    clearInterval(progressTimer);
    if (preloaderCounter) preloaderCounter.textContent = 'ERR';
  }
}

function updateHeroKPIs(nationalData) {
  const totalHosp = d3.sum(nationalData, d => d.Hospitalisations);
  const totalBeds = d3.sum(nationalData, d => d.BedDays);
  const avgStay = totalBeds / totalHosp;
  
  const peakYearObj = nationalData.reduce((prev, curr) => 
    (curr.Hospitalisations > prev.Hospitalisations) ? curr : prev, nationalData[0]);

  const elTotalHosp = document.getElementById('kpi-total-hosp');
  const elTotalBeds = document.getElementById('kpi-total-beds');
  const elAvgStay = document.getElementById('kpi-avg-stay');
  const elPeakYear = document.getElementById('kpi-peak-year');

  if (elTotalHosp) elTotalHosp.textContent = window.formatNumber(totalHosp);
  if (elTotalBeds) elTotalBeds.textContent = window.formatNumber(totalBeds);
  if (elAvgStay) elAvgStay.textContent = window.formatDecimal(avgStay);
  if (elPeakYear) elPeakYear.textContent = peakYearObj.Year;
}

document.addEventListener('DOMContentLoaded', initApp);
