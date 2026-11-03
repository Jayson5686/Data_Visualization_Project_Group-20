/**
 * Storyline 3: State and Territory Patterns
 * Dual-Pane Architecture (bikerental.webp style):
 * Left Dark Matrix Pane (Heatmap) + Right Alabaster Trajectory & Journey Cards Pane
 */

function initStoryline3(stateData) {
  const containerHeatmap = document.getElementById('chart-storyline3-heatmap');
  const containerLine = document.getElementById('chart-storyline3-stateline');
  if (!containerHeatmap || !containerLine) return;

  containerHeatmap.innerHTML = '';
  containerLine.innerHTML = '';

  let activeMeasure = window.AppState.activeMeasureS3 || 'Hospitalisations';
  let activeState = window.AppState.activeStateS3 || 'NSW';

  const states = ['NSW', 'Vic', 'Qld', 'WA', 'SA', 'Tas', 'ACT', 'NT'];
  const years = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021];
  let activeMapYear = window.AppState.activeYearS3 || 2021;
  let focusedState = states[0];
  let focusedYear = years[0];

  const mapRegions = [
    { State: 'WA', path: 'M28,83 L190,74 L200,105 L194,188 L182,211 L185,278 L157,313 L105,308 L76,288 L55,251 L35,224 Z', labelX: 111, labelY: 190 },
    { State: 'NT', path: 'M204,37 L337,36 L344,69 L340,164 L321,179 L202,170 L199,99 Z', labelX: 270, labelY: 112 },
    { State: 'SA', path: 'M200,180 L337,181 L349,208 L345,322 L321,346 L222,331 L184,296 L189,246 Z', labelX: 267, labelY: 268 },
    { State: 'Qld', path: 'M350,38 L455,37 L500,61 L501,190 L477,221 L449,205 L405,211 L350,176 L343,100 Z', labelX: 423, labelY: 133 },
    { State: 'NSW', path: 'M351,218 L480,224 L485,276 L468,331 L445,357 L351,350 L345,322 L348,263 Z', labelX: 415, labelY: 288 },
    { State: 'ACT', path: 'M435,333 L444,328 L451,335 L447,345 L438,346 Z', labelX: 472, labelY: 326 },
    { State: 'Vic', path: 'M349,357 L442,364 L463,352 L452,395 L422,414 L366,406 L341,385 Z', labelX: 402, labelY: 385 },
    { State: 'Tas', path: 'M425,431 L452,427 L466,443 L457,466 L439,470 L425,454 Z', labelX: 446, labelY: 450 }
  ];

  const stateMapSvg = d3.select('#chart-storyline3-state-map')
    .append('svg')
    .attr('class', 'chart-svg state-map-svg')
    .attr('viewBox', '0 0 530 490')
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('role', 'group')
    .attr('aria-label', 'Schematic state-level map; boundaries are not to scale');

  const stateMapGroup = stateMapSvg.append('g')
    .attr('class', 'state-map-regions');

  // 1. Setup Heatmap Matrix (Dark Left Pane)
  const marginHm = { top: 20, right: 16, bottom: 34, left: 50 };
  const widthHm = 620 - marginHm.left - marginHm.right;
  const heightHm = 380 - marginHm.top - marginHm.bottom;

  const svgHm = d3.select(containerHeatmap)
    .append('svg')
    .attr('class', 'chart-svg')
    .attr('viewBox', `0 0 ${widthHm + marginHm.left + marginHm.right} ${heightHm + marginHm.top + marginHm.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const gHm = svgHm.append('g')
    .attr('transform', `translate(${marginHm.left},${marginHm.top})`);

  const xHmScale = d3.scaleBand()
    .domain(years)
    .range([0, widthHm])
    .padding(0.08);

  const yHmScale = d3.scaleBand()
    .domain(states)
    .range([0, heightHm])
    .padding(0.12);

  gHm.append('g')
    .attr('class', 'axis axis-x')
    .attr('transform', `translate(0,${heightHm})`)
    .call(d3.axisBottom(xHmScale).tickFormat(d3.format('d')));

  gHm.append('g')
    .attr('class', 'axis axis-y')
    .call(d3.axisLeft(yHmScale));

  const colorScale = d3.scaleSequential()
    .interpolator(getHeatmapInterpolator());

  function getHeatmapInterpolator() {
    return document.documentElement.dataset.theme === 'high-contrast'
      ? d3.interpolateRgb('#000000', '#FFFF00')
      : d3.interpolateYlGnBu;
  }

  const rowHighlight = gHm.append('rect')
    .attr('class', 'state-row-highlight')
    .attr('x', -6)
    .attr('width', widthHm + 12)
    .attr('height', yHmScale.bandwidth() + 6)
    .style('display', 'none');

  // 2. Setup Coordinated State Trajectory Line Chart (Light Right Pane)
  const marginLine = { top: 18, right: 24, bottom: 34, left: 54 };
  const widthLine = 440 - marginLine.left - marginLine.right;
  const heightLine = 225 - marginLine.top - marginLine.bottom;

  const svgLine = d3.select(containerLine)
    .append('svg')
    .attr('class', 'chart-svg')
    .attr('viewBox', `0 0 ${widthLine + marginLine.left + marginLine.right} ${heightLine + marginLine.top + marginLine.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const gLine = svgLine.append('g')
    .attr('transform', `translate(${marginLine.left},${marginLine.top})`);

  const xLineScale = d3.scaleLinear()
    .domain([2011, 2021])
    .range([0, widthLine]);

  const yLineScale = d3.scaleLinear()
    .range([heightLine, 0]);

  const lineGridGroup = gLine.append('g').attr('class', 'grid');
  const xLineAxisGroup = gLine.append('g')
    .attr('class', 'axis axis-x')
    .attr('transform', `translate(0,${heightLine})`);
  const yLineAxisGroup = gLine.append('g').attr('class', 'axis axis-y');

  const stateAreaPath = gLine.append('path').attr('class', 'area-path');
  const stateLinePath = gLine.append('path')
    .attr('class', 'line-path')
    .attr('stroke', 'var(--chart-line)');

  const statePointsGroup = gLine.append('g');

  function localized(value) {
    const language = document.documentElement.dataset.language || 'en';
    return window.translateCrashMetrics
      ? window.translateCrashMetrics(value, language)
      : value;
  }

  function localizedStateName(code) {
    return localized(getStateFullName(code));
  }

  function renderHeatmapTable() {
    const tableContainer = document.getElementById('s3-heatmap-table');
    if (!tableContainer) return;

    const rows = states.map(state => {
      const stateName = getStateFullName(state);
      const stateLabel = localized('Select state ') + localized(stateName);
      const cells = years.map(year => {
        const datum = stateData.find(item => item.State === state && item.Year === year);
        const value = datum ? window.formatNumber(datum[activeMeasure]) : '—';
        return `<td>${value}</td>`;
      }).join('');
      return `<tr><th scope="row"><button type="button" class="heatmap-state-select" data-state="${state}" aria-label="${stateLabel}">${state}</button></th>${cells}</tr>`;
    }).join('');

    tableContainer.innerHTML = `
      <table class="heatmap-values-table">
        <caption>${localized('State and Territory values')} · ${localized(activeMeasure === 'Hospitalisations' ? 'Admissions' : 'Bed Days')}</caption>
        <thead><tr><th scope="col">${localized('State / Year')}</th>${years.map(year => `<th scope="col">${year}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    tableContainer.querySelectorAll('.heatmap-state-select').forEach(button => {
      button.addEventListener('click', () => selectState(button.dataset.state));
    });
  }

  function setFocusedCell(state, year, shouldFocus) {
    focusedState = state;
    focusedYear = year;
    const cells = gHm.selectAll('.heatmap-cell');
    cells.attr('tabindex', -1);
    const cell = cells
      .filter(d => d.State === focusedState && d.Year === focusedYear)
      .attr('tabindex', 0)
      .node();
    if (shouldFocus && cell) cell.focus();
  }

  function updateHeatmap() {
    const t = d3.transition().duration(window.chartMotionDuration(500)).ease(d3.easeCubicOut);

    colorScale.interpolator(getHeatmapInterpolator());
    const maxVal = d3.max(stateData, d => d[activeMeasure]) || 1;
    colorScale.domain([0, maxVal]);

    const cells = gHm.selectAll('.heatmap-cell')
      .data(stateData, d => `${d.State}-${d.Year}`);

    cells.join(
      enter => enter.append('rect')
        .attr('class', 'heatmap-cell')
        .attr('x', d => xHmScale(d.Year))
        .attr('y', d => yHmScale(d.State))
        .attr('width', xHmScale.bandwidth())
        .attr('height', yHmScale.bandwidth())
        .attr('fill', d => colorScale(d[activeMeasure]))
        .attr('role', 'button')
        .classed('active', d => d.State === activeState)
        .style('opacity', 0)
        .call(enter => enter.transition(t).style('opacity', 1)),
      update => {
        update.classed('active', d => d.State === activeState);
        return update.transition(t).attr('fill', d => colorScale(d[activeMeasure]));
      },
      exit => exit.remove()
    );

    gHm.selectAll('.heatmap-cell')
      .attr('tabindex', d => d.State === focusedState && d.Year === focusedYear ? 0 : -1)
      .attr('role', 'button')
      .attr('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown Enter Space Home End Control+Home Control+End')
      .attr('aria-pressed', d => d.State === activeState ? 'true' : 'false')
      .attr('aria-label', d => {
        const language = document.documentElement.dataset.language || 'en';
        const stateName = window.translateCrashMetrics
          ? window.translateCrashMetrics(getStateFullName(d.State), language)
          : getStateFullName(d.State);
        const admissionsLabel = localized('Admissions');
        const bedDaysLabel = localized('Bed Days');
        const actionLabel = localized('Press Enter to select this state.');
        return `${stateName}, ${d.Year}. ${admissionsLabel}: ${window.formatNumber(d.Hospitalisations)}. ${bedDaysLabel}: ${window.formatNumber(d.BedDays)}. ${actionLabel}`;
      });

    if (activeState) {
      rowHighlight
        .style('display', 'block')
        .transition(t)
        .attr('y', yHmScale(activeState) - 3);
    }

    gHm.selectAll('.heatmap-cell')
      .on('mouseenter', function(event, d) {
        window.showTooltip(event, `
          <div class="tooltip-header">
            <span class="tooltip-tag">${localized('Jurisdiction Cell')}</span>
            <span class="tooltip-badge">${d.Year}</span>
          </div>
          <div class="tooltip-title">${localizedStateName(d.State)} (${d.State})</div>
          <div class="tooltip-metric-row">
            <span class="tooltip-value">${window.formatNumber(d[activeMeasure])}</span>
            <span class="tooltip-subvalue">${localized(activeMeasure === 'Hospitalisations' ? 'Admissions' : 'Bed Days')}</span>
          </div>
          <div class="tooltip-extra">
            ${localized('Admissions:')}<strong>${window.formatNumber(d.Hospitalisations)}</strong><br>
            ${localized('Bed Days:')}<strong>${window.formatNumber(d.BedDays)}</strong><br>
            ${localized('Avg Stay:')}<strong>${(d.BedDays / d.Hospitalisations).toFixed(1)} ${localized('days')}</strong>
          </div>
        `);
      })
      .on('mouseleave', () => {
        window.hideTooltip();
      })
      .on('click', function(event, d) {
        selectMapYear(d.Year);
        selectState(d.State);
        setFocusedCell(d.State, d.Year, false);
      })
      .on('keydown', function(event, d) {
        const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        const supportedKeys = [...arrowKeys, 'Home', 'End'];
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          selectMapYear(d.Year);
          selectState(d.State);
          return;
        }
        if (!supportedKeys.includes(event.key)) return;

        event.preventDefault();
        event.stopPropagation();
        let stateIndex = states.indexOf(d.State);
        let yearIndex = years.indexOf(d.Year);
        if (event.key === 'ArrowLeft') yearIndex = Math.max(0, yearIndex - 1);
        if (event.key === 'ArrowRight') yearIndex = Math.min(years.length - 1, yearIndex + 1);
        if (event.key === 'ArrowUp') stateIndex = Math.max(0, stateIndex - 1);
        if (event.key === 'ArrowDown') stateIndex = Math.min(states.length - 1, stateIndex + 1);
        if (event.key === 'Home') yearIndex = 0;
        if (event.key === 'End') yearIndex = years.length - 1;
        if (event.ctrlKey && event.key === 'Home') stateIndex = 0;
        if (event.ctrlKey && event.key === 'End') stateIndex = states.length - 1;

        setFocusedCell(states[stateIndex], years[yearIndex], true);
      });

    updateStateMap(t);
    updateLegendCanvas(maxVal);
    renderHeatmapTable();
    updateStateLineChart();
    if (window.refreshDataTable) window.refreshDataTable('storyline3');
  }

  function updateStateMap(transition = d3.transition().duration(window.chartMotionDuration(400))) {
    const mapData = stateData
      .filter(d => d.Year === Number(activeMapYear))
      .sort((a, b) => mapRegions.findIndex(region => region.State === a.State) - mapRegions.findIndex(region => region.State === b.State));
    const regions = stateMapGroup.selectAll('.state-map-region')
      .data(mapData, d => d.State);

    regions.join(
      enter => {
        const group = enter.append('g')
          .attr('class', 'state-map-region')
          .attr('role', 'button')
          .attr('tabindex', 0)
          .attr('aria-keyshortcuts', 'Enter Space')
          .on('click', (event, d) => selectState(d.State))
          .on('keydown', (event, d) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              selectState(d.State);
            }
          })
          .on('mouseenter', (event, d) => {
            window.showTooltip(event, `
              <div class="tooltip-header">
                <span class="tooltip-tag">${localized('State / Territory')}</span>
                <span class="tooltip-badge">${d.Year}</span>
              </div>
              <div class="tooltip-title">${localizedStateName(d.State)}</div>
              <div class="tooltip-metric-row">
                <span class="tooltip-value">${window.formatNumber(d[activeMeasure])}</span>
                <span class="tooltip-subvalue">${localized(activeMeasure === 'Hospitalisations' ? 'Admissions' : 'Bed Days')}</span>
              </div>
              <div class="tooltip-extra">
                ${localized('Admissions:')}<strong>${window.formatNumber(d.Hospitalisations)}</strong><br>
                ${localized('Bed Days:')}<strong>${window.formatNumber(d.BedDays)}</strong>
              </div>
            `);
          })
          .on('mouseleave', window.hideTooltip);

        group.append('path')
          .attr('class', 'state-map-shape')
          .attr('d', d => mapRegions.find(region => region.State === d.State).path);
        group.append('text')
          .attr('class', 'state-map-code')
          .attr('text-anchor', 'middle')
          .attr('pointer-events', 'none')
          .attr('x', d => mapRegions.find(region => region.State === d.State).labelX)
          .attr('y', d => mapRegions.find(region => region.State === d.State).labelY);
        group.append('text')
          .attr('class', 'state-map-value')
          .attr('text-anchor', 'middle')
          .attr('pointer-events', 'none')
          .attr('x', d => mapRegions.find(region => region.State === d.State).labelX)
          .attr('y', d => mapRegions.find(region => region.State === d.State).labelY + 22);
        return group;
      },
      update => update,
      exit => exit.remove()
    )
      .classed('active', d => d.State === activeState)
      .attr('aria-pressed', d => d.State === activeState ? 'true' : 'false')
      .attr('aria-label', d => `${localized('Select state ')}${localizedStateName(d.State)}. ${d.Year}. ${localized(activeMeasure === 'Hospitalisations' ? 'Admissions' : 'Bed Days')}: ${window.formatNumber(d[activeMeasure])}.`)
      .select('.state-map-shape')
      .transition(transition)
      .attr('fill', d => colorScale(d[activeMeasure]));

    stateMapGroup.selectAll('.state-map-region')
      .each(function(d) {
        const region = d3.select(this);
        region.select('.state-map-code').text(d.State);
        region.select('.state-map-value').text(window.formatNumber(d[activeMeasure]));
      });
  }

  function selectMapYear(year) {
    activeMapYear = Number(year);
    window.AppState.activeYearS3 = activeMapYear;
    if (yearSelect) yearSelect.value = String(activeMapYear);
    updateStateMap();
  }

  function selectState(stateCode) {
    activeState = stateCode;
    window.AppState.activeStateS3 = activeState;

    const dropdown = document.getElementById('s3-state-dropdown');
    if (dropdown) dropdown.value = activeState;

    const badge = document.getElementById('s3-focus-state-badge');
    if (badge)     badge.textContent = localized(`${activeState} Trajectory`);

    gHm.selectAll('.heatmap-cell')
      .classed('active', d => d.State === activeState)
      .attr('aria-pressed', d => d.State === activeState ? 'true' : 'false');
    stateMapGroup.selectAll('.state-map-region')
      .classed('active', d => d.State === activeState)
      .attr('aria-pressed', d => d.State === activeState ? 'true' : 'false');

    rowHighlight
      .style('display', 'block')
      .transition().duration(window.chartMotionDuration(280))
      .attr('y', yHmScale(activeState) - 3);

    updateStateLineChart();
    if (window.refreshDataTable) window.refreshDataTable('storyline3');
  }

  function updateStateLineChart() {
    const t = d3.transition().duration(window.chartMotionDuration(550)).ease(d3.easeCubicOut);

    const filtered = stateData.filter(d => d.State === activeState);
    filtered.sort((a, b) => a.Year - b.Year);

    const totalStateHosp = d3.sum(filtered, d => d.Hospitalisations);
    const totalStateBeds = d3.sum(filtered, d => d.BedDays);
    const metaSummary = document.getElementById('s3-state-meta-summary');
    if (metaSummary) {
      metaSummary.innerHTML = `${localized('11-Year Total:')} <strong>${window.formatNumber(totalStateHosp)}</strong> ${localized('Admissions')} · <strong>${window.formatNumber(totalStateBeds)}</strong> ${localized('Bed Days')}`;
    }

    // Update Dark Journey Milestone Cards (bikerental.webp "Latest journeys" cards)
    const d2011 = filtered.find(d => d.Year === 2011);
    const d2019 = filtered.find(d => d.Year === 2019);
    const d2020 = filtered.find(d => d.Year === 2020);
    const d2021 = filtered.find(d => d.Year === 2021);

    if (d2011 && d2019) {
      const pct1 = (((d2019[activeMeasure] - d2011[activeMeasure]) / d2011[activeMeasure]) * 100).toFixed(1);
      const j1Start = document.getElementById('s3-j1-start');
      const j1Delta = document.getElementById('s3-j1-delta');
      const j1End = document.getElementById('s3-j1-end');
      if (j1Start) j1Start.textContent = `2011: ${window.formatNumber(d2011[activeMeasure])}`;
      if (j1Delta) j1Delta.textContent = `${pct1 >= 0 ? '+' : ''}${pct1}%`;
      if (j1End) j1End.textContent = `2019: ${window.formatNumber(d2019[activeMeasure])}`;
    }

    if (d2020 && d2021) {
      const pct2 = (((d2021[activeMeasure] - d2020[activeMeasure]) / d2020[activeMeasure]) * 100).toFixed(1);
      const j2Start = document.getElementById('s3-j2-start');
      const j2Delta = document.getElementById('s3-j2-delta');
      const j2End = document.getElementById('s3-j2-end');
      if (j2Start) j2Start.textContent = `2020: ${window.formatNumber(d2020[activeMeasure])}`;
      if (j2Delta) j2Delta.textContent = `${pct2 >= 0 ? '+' : ''}${pct2}%`;
      if (j2End) j2End.textContent = `2021: ${window.formatNumber(d2021[activeMeasure])}`;
    }

    const yMax = d3.max(filtered, d => d[activeMeasure]) || 1;
    const yMin = d3.min(filtered, d => d[activeMeasure]) * 0.85;
    yLineScale.domain([yMin, yMax * 1.1]);

    xLineAxisGroup.call(
      d3.axisBottom(xLineScale)
        .tickValues([2011, 2013, 2015, 2017, 2019, 2021])
        .tickFormat(d3.format('d'))
    );

    yLineAxisGroup.transition(t).call(
      d3.axisLeft(yLineScale).ticks(4).tickFormat(d3.format('~s'))
    );

    lineGridGroup.transition(t).call(
      d3.axisLeft(yLineScale).ticks(4).tickSize(-widthLine).tickFormat('')
    ).call(g => g.select('.domain').remove());

    const lineGen = d3.line()
      .x(d => xLineScale(d.Year))
      .y(d => yLineScale(d[activeMeasure]))
      .curve(d3.curveMonotoneX);

    const areaGen = d3.area()
      .x(d => xLineScale(d.Year))
      .y0(heightLine)
      .y1(d => yLineScale(d[activeMeasure]))
      .curve(d3.curveMonotoneX);

    stateLinePath.datum(filtered).transition(t).attr('d', lineGen);
    stateAreaPath.datum(filtered).transition(t).attr('d', areaGen);

    const points = statePointsGroup.selectAll('.data-point')
      .data(filtered, d => d.Year);

    points.join(
      enter => enter.append('circle')
        .attr('class', 'data-point')
        .attr('cx', d => xLineScale(d.Year))
        .attr('cy', d => yLineScale(d[activeMeasure]))
        .attr('r', 4)
        .call(enter => enter.transition(t).attr('cy', d => yLineScale(d[activeMeasure]))),
      update => update.transition(t)
        .attr('cx', d => xLineScale(d.Year))
        .attr('cy', d => yLineScale(d[activeMeasure])),
      exit => exit.remove()
    );

    statePointsGroup.selectAll('.data-point')
      .on('mouseenter', function(event, d) {
        window.showTooltip(event, `
          <div class="tooltip-header">
            <span class="tooltip-tag">${localized(`${d.State} Trajectory`)}</span>
            <span class="tooltip-badge">${d.Year}</span>
          </div>
          <div class="tooltip-title">${localizedStateName(d.State)}</div>
          <div class="tooltip-metric-row">
            <span class="tooltip-value">${window.formatNumber(d[activeMeasure])}</span>
            <span class="tooltip-subvalue">${localized(activeMeasure === 'Hospitalisations' ? 'Admissions' : 'Bed Days')}</span>
          </div>
          <div class="tooltip-extra">
            ${localized('Bed Days:')}<strong>${window.formatNumber(d.BedDays)}</strong><br>
            ${localized('Avg Stay:')}<strong>${(d.BedDays / d.Hospitalisations).toFixed(1)} ${localized('days')}</strong>
          </div>
        `);
      })
      .on('mouseleave', () => {
        window.hideTooltip();
      });
  }

  function updateLegendCanvas(maxVal) {
    const canvas = document.getElementById('s3-legend-canvas');
    const minLabel = document.getElementById('s3-legend-min');
    const maxLabel = document.getElementById('s3-legend-max');

    if (minLabel) minLabel.textContent = '0';
    if (maxLabel) maxLabel.textContent = window.formatNumber(maxVal);

    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    for (let x = 0; x < width; x++) {
      const ratio = x / width;
      ctx.fillStyle = colorScale(ratio * maxVal);
      ctx.fillRect(x, 0, 1, height);
    }
  }

  function getStateFullName(code) {
    const map = {
      NSW: 'New South Wales',
      Vic: 'Victoria',
      Qld: 'Queensland',
      WA: 'Western Australia',
      SA: 'South Australia',
      Tas: 'Tasmania',
      ACT: 'Australian Capital Territory',
      NT: 'Northern Territory'
    };
    return map[code] || code;
  }

  const dropdown = document.getElementById('s3-state-dropdown');
  if (dropdown) {
    dropdown.addEventListener('change', (e) => {
      selectState(e.target.value);
    });
  }

  const yearSelect = document.getElementById('s3-year-select');
  if (yearSelect) {
    yearSelect.value = String(activeMapYear);
    yearSelect.addEventListener('change', event => {
      selectMapYear(event.target.value);
    });
  }

  const btnHosp = document.getElementById('s3-btn-hosp');
  const btnBeds = document.getElementById('s3-btn-beds');

  if (btnHosp && btnBeds) {
    btnHosp.addEventListener('click', () => {
      btnHosp.classList.add('active');
      btnBeds.classList.remove('active');
      btnHosp.setAttribute('aria-pressed', 'true');
      btnBeds.setAttribute('aria-pressed', 'false');
      activeMeasure = 'Hospitalisations';
      window.AppState.activeMeasureS3 = activeMeasure;
      updateHeatmap();
    });

    btnBeds.addEventListener('click', () => {
      btnBeds.classList.add('active');
      btnHosp.classList.remove('active');
      btnBeds.setAttribute('aria-pressed', 'true');
      btnHosp.setAttribute('aria-pressed', 'false');
      activeMeasure = 'BedDays';
      window.AppState.activeMeasureS3 = activeMeasure;
      updateHeatmap();
    });
  }

  window.reset3 = () => {
    activeMeasure = 'Hospitalisations';
    activeMapYear = 2021;
    window.AppState.activeMeasureS3 = activeMeasure;
    window.AppState.activeYearS3 = activeMapYear;
    if (yearSelect) yearSelect.value = String(activeMapYear);
    if (btnHosp) btnHosp.classList.add('active');
    if (btnBeds) btnBeds.classList.remove('active');
    if (btnHosp) btnHosp.setAttribute('aria-pressed', 'true');
    if (btnBeds) btnBeds.setAttribute('aria-pressed', 'false');
    updateHeatmap();
    selectState('NSW');
  };

  const heatmapThemeObserver = new MutationObserver(updateHeatmap);
  heatmapThemeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
  window.addEventListener('crashmetrics:languagechange', () => {
    updateHeatmap();
    selectState(activeState);
    window.hideTooltip();
  });
  updateHeatmap();
  selectState(activeState);
}
