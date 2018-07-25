(function () {
    if (!window.appPedimap) return console.error('La aplicación requiere del modulo inicial');
    if (Number.isInteger === undefined) {
        Number.isInteger = function (n) {
            return (n ^ 0) === +n;
        }
    }


    appPedimap.chartBarHorizontal = function (options) {
        var result = dataBarFormat(options.data, options.labels, options.datasets);
        var title = options.title;
        var onLabelClick = options.onLabelClick;
        var legend = options.legend === undefined ? true : options.legend;
        var responsiveLabels = options.responsiveLabels === undefined ? true : options.responsiveLabels;
        var format = options.format || 'units';
        resetCanvas({
            id: options.id,
            height: (options.data.length) * 40,
            width: options.width,
            styleClass: 'chart-horizontalBar'
        });
        console.log(result)
        var canvas = $('#' + options.id + ' canvas')[0].getContext('2d');
        return new Chart(canvas, {
            type: 'horizontalBar',
            data: result.data,
            options: {
                responsive: (options.responsive === undefined ? true : options.responsive),
                maintainAspectRatio: (options.maintainAspectRatio === undefined ? false : options.maintainAspectRatio),
                onClick: function (e) {
                    var position = Chart.helpers.getRelativePosition(e, this.chart);
                    var limitX = this.chartArea.left;
                    var datasets = this.data.datasets;

                    if (position.x > limitX || !(onLabelClick instanceof Function)) {
                        return;
                    }

                    if (datasets.length > 1) {
                        var top = datasets[0]
                        var bottom = datasets[1]

                        for (var j = 0; j < datasets.length; j++) {
                            if (datasets[j].stack < top.stack) {
                                top = datasets[j];
                            }
                            if (datasets[j].stack > bottom.stack) {
                                bottom = datasets[j];
                            }
                        }

                        var labelTop = top._meta[this.id].data
                        var labelBottom = bottom._meta[this.id].data

                        if (labelTop.length !== labelBottom.length) {
                            return;
                        }

                        for (var i = 0; i < labelTop.length; i++) {
                            var condtionTop = labelTop[i].getCenterPoint();
                            var conditionBottom = labelBottom[i].getCenterPoint();
                            var labelValue = labelTop[i]._model.label;
                            var nameValues = result.index ? result.index[labelValue].split(' - ') : [''];
                            var nameLabel = nameValues.length === 1 ? nameValues[0] : nameValues[1];
                            var labelName = nameLabel === '' ? null : nameLabel;

                            if ((conditionBottom.y - condtionTop.y) > 13) {
                                if (condtionTop.y < position.y && conditionBottom.y > position.y) {
                                    return onLabelClick(labelValue, labelName);
                                }
                            } else if ((conditionBottom.y - condtionTop.y) <= 13) {
                                if (condtionTop.y - 15 < position.y && conditionBottom.y + 5 > position.y) {
                                    return onLabelClick(labelValue, labelName);
                                }
                            } else if (condtionTop.y === conditionBottom.y) {
                                if (condtionTop.y - 15 < position.y && conditionBottom.y + 5 > position.y) {
                                    return onLabelClick(labelValue, labelName);
                                }
                            }
                        }
                        return;
                    }

                    if (datasets.length === 1) {
                        var label = datasets[0]._meta[this.id].data

                        for (var k = 0; k < label.length; k++) {
                            var condition = label[k].getCenterPoint();
                            var _labelValue = label[k]._model.label;
                            var _nameValues = result.index ? result.index[_labelValue].split(' - ') : [''];
                            var _nameLabel = _nameValues.length === 1 ? _nameValues[0] : _nameValues[1];
                            var _labelName = _nameLabel === '' ? null : _nameLabel;
                            if (condition.y - 10 < position.y && condition.y + 10 > position.y) {
                                return onLabelClick(_labelValue, _labelName);
                            }
                        }
                    }


                },
                tooltips: {
                    callbacks: {
                        title: function (chart, data) {
                            if (!result.index) {
                                return data['labels'][chart[0]['index']];
                            }
                            return result.index[data['labels'][chart[0]['index']]];
                        },
                        label: function (tooltipItem, data) {
                            var datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
                            switch (format) {
                                case 'money':
                                    return datasetLabel + ' : S/ ' + appPedimap.formatNumber(tooltipItem.xLabel, 2, '.', ',');
                                    break;
                                case 'percentage':
                                    return datasetLabel + ' : ' + appPedimap.formatNumber(tooltipItem.xLabel, 2, '.', ',') + '%';
                                    break;
                                default:
                                    return datasetLabel + ' : ' + appPedimap.formatNumber(tooltipItem.xLabel, 0, '.', ',');
                                    break;
                            }
                        }
                    }
                },
                title: {
                    display: true,
                    text: title
                },
                legend: {
                    display: legend,
                    position: 'bottom',
                    onClick: function (e, legendItem) {
                        var index = legendItem.datasetIndex;
                        var ci = this.chart;
                        var data_ = ci.config.data.datasets[index].data;
                        var alreadyHidden = (ci.getDatasetMeta(index).hidden === null) ? false : ci.getDatasetMeta(index).hidden;
                        var new_order = sortWithIndeces(data_).sortIndices
                        var new_labels = changeArrayOrder(ci.config.data.labels, new_order)
                        ci.config.data.datasets.forEach(function (e, i) {
                            var new_data = changeArrayOrder(ci.config.data.datasets[i].data, new_order);
                            ci.config.data.datasets[i].data = new_data;
                            ci.data.datasets[i].data = new_data;
                        });
                        ci.config.data.labels = new_labels;
                        ci.data.labels = new_labels;
                        ci.data.datasets.forEach(function (e, i) {
                            var meta = ci.getDatasetMeta(i);
                            if (i !== index) {
                                if (!alreadyHidden) {
                                    meta.hidden = meta.hidden === null ? !meta.hidden : null;
                                } else if (meta.hidden === null) {
                                    meta.hidden = true;
                                }
                            } else if (i === index) {
                                meta.hidden = null;
                            }
                        });
                        ci.update()
                    }
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            min: 0,
                            fontSize: 10,
                            beginAtZero: true,
                            //max: format === 'percentage' ? 100 : undefined,
                            //stepSize: 1,
                            callback: function (value) {
                                switch (format) {
                                    case 'percentage':
                                        return value + '%';
                                        break;
                                    default:
                                        return appPedimap.formatNumber(value, (Number.isInteger(value) ? 0 : 2), '.', ',');
                                        break;
                                }
                            }

                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        barPercentage: (options.datasets.length > 1 ? 0.9 : 0.5),
                        //barThickness: (options.datasets.length > 1 ? undefined : 50),
                        ticks: {
                            fontSize: 10,
                            callback: function (tick, index, ticks) {
                                var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                                if (result.index === null) {
                                    return tick;
                                }

                                if (!responsiveLabels) {
                                    return result.index[tick];
                                } else {
                                    if (width <= 1440) {
                                        return tick;
                                    }
                                    return result.index[tick];
                                }
                            }
                        }
                    }]
                }
            }
        });
    }

    appPedimap.chartBarVertical = function (options) {
        var result = dataBarFormat(options.data, options.labels, options.datasets);
        var legend = options.legend === undefined ? true : options.legend;
        var title = options.title;
        var responsiveLabels = options.responsiveLabels === undefined ? true : options.responsiveLabels;
        var onLabelClick = options.onLabelClick;
        var format = options.format || 'units';
        resetCanvas({id: options.id, height: 300, styleClass: 'chart-bar'});
        var canvas = $('#' + options.id + ' canvas')[0].getContext('2d');
        return new Chart(canvas, {
            type: 'bar',
            data: result.data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                onClick: function (e) {
                    var position = Chart.helpers.getRelativePosition(e, this.chart);
                    var limitY = this.chartArea.bottom;
                    var datasets = this.data.datasets;

                    if (position.y < limitY || !(onLabelClick instanceof Function)) {
                        return;
                    }

                    if (datasets.length > 1) {
                        var left = datasets[0];
                        var right = datasets[1];
                        for (var j = 0; j < datasets.length; j++) {
                            if (datasets[j].stack < left.stack) {
                                left = datasets[j];
                            }
                            if (datasets[j].stack > right.stack) {
                                right = datasets[j];
                            }
                        }
                        var labelLeft = left._meta[this.id].data
                        var labelRight = right._meta[this.id].data
                        if (labelLeft.length !== labelRight.length) {
                            return;
                        }
                        for (var i = 0; i < labelLeft.length; i++) {
                            var condtionLeft = labelLeft[i].getCenterPoint();
                            var conditionRight = labelRight[i].getCenterPoint();
                            if ((conditionRight.x - condtionLeft.x) > 13) {
                                if (condtionLeft.x < position.x && conditionRight.x > position.x) {
                                    return onLabelClick(labelLeft[i]._model.label);
                                }
                            } else if ((conditionRight.x - condtionLeft.x) <= 13) {
                                if (condtionLeft.x - 15 < position.x && conditionRight.x + 5 > position.x) {
                                    return onLabelClick(labelLeft[i]._model.label);
                                }
                            } else if (condtionLeft.x === conditionRight.x) {
                                if (condtionLeft.x - 15 < position.x && conditionRight.x + 5 > position.x) {
                                    return onLabelClick(labelLeft[i]._model.label);
                                }
                            }
                        }
                        return;
                    }
                    if (datasets.length === 1) {
                        var label = datasets[0]._meta[this.id].data
                        for (var k = 0; k < label.length; k++) {
                            var condition = label[k].getCenterPoint();
                            if (condition.x - 10 < position.x && condition.x + 10 > position.x) {
                                return onLabelClick(label[k]._model.label);
                            }
                        }
                    }
                },
                tooltips: {
                    mode: 'index',
                    callbacks: {
                        title: function (chart, data) {
                            if (!result.index) {
                                return data['labels'][chart[0]['index']];
                            }
                            return result.index[data['labels'][chart[0]['index']]];
                        },
                        label: function (tooltipItem, data) {
                            var datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
                            switch (format) {
                                case 'money':
                                    return datasetLabel + ' : S/ ' + appPedimap.formatNumber(tooltipItem.yLabel, 2, '.', ',');
                                    break;
                                case 'percentage':
                                    return datasetLabel + ' : ' + appPedimap.formatNumber(tooltipItem.yLabel, 2, '.', ',') + '%';
                                    break;
                                default:
                                    return datasetLabel + ' : ' + appPedimap.formatNumber(tooltipItem.yLabel, 0, '.', ',');
                                    break;
                            }
                        }
                    }
                },
                title: {
                    display: true,
                    text: title
                },
                legend: {
                    display: legend,
                    position: 'bottom',
                    onClick: function (e, legendItem) {
                        var index = legendItem.datasetIndex;
                        var ci = this.chart;
                        var data_ = ci.config.data.datasets[index].data;
                        var alreadyHidden = (ci.getDatasetMeta(index).hidden === null) ? false : ci.getDatasetMeta(index).hidden;
                        var new_order = sortWithIndeces(data_).sortIndices
                        var new_labels = changeArrayOrder(ci.config.data.labels, new_order)
                        ci.config.data.datasets.forEach(function (e, i) {
                            var new_data = changeArrayOrder(ci.config.data.datasets[i].data, new_order);
                            ci.config.data.datasets[i].data = new_data;
                            ci.data.datasets[i].data = new_data;
                        });
                        ci.config.data.labels = new_labels;
                        ci.data.labels = new_labels;
                        ci.data.datasets.forEach(function (e, i) {
                            var meta = ci.getDatasetMeta(i);
                            if (i !== index) {
                                if (!alreadyHidden) {
                                    meta.hidden = meta.hidden === null ? !meta.hidden : null;
                                } else if (meta.hidden === null) {
                                    meta.hidden = true;
                                }
                            } else if (i === index) {
                                meta.hidden = null;
                            }
                        });
                        ci.update()
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                            //max: format === 'percentage' ? 100 : undefined,
                            fontSize: 10,
                            callback: function (value) {
                                switch (format) {
                                    case 'percentage':
                                        return value + '%';
                                        break;
                                    default:
                                        return appPedimap.formatNumber(value, (Number.isInteger(value) ? 0 : 2), '.', ',');
                                        break;
                                }
                            }
                        }
                    }],
                    xAxes: [{
                        stacked: true,
                        //barThickness: (options.datasets.length > 1 ? undefined : 50),
                        barPercentage: (options.data.length > 1 ? 0.9 : (options.datasets.length > 2 ? 0.5 : 0.4)),
                        ticks: {
                            fontSize: 10,
                            callback: function (tick, index, ticks) {
                                var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                                if (result.index === null) {
                                    return tick;
                                }

                                if (!responsiveLabels) {
                                    return result.index[tick];
                                } else {
                                    if (width <= 768) {
                                        return tick;
                                    }
                                    return result.index[tick];
                                }
                            }
                        }
                    }]
                }
            }
        });
    }

    appPedimap.chartPie = function (options) {
        var data = dataPieFormat(options.data, options.labels, options.datasets);
        var legend = options.legend === undefined ? true : options.legend;
        var title = options.title;
        var format = options.format || 'units';
        resetCanvas({id: options.id, height: 300, styleClass: 'chart-pie'});
        var canvas = $('#' + options.id + ' canvas')[0].getContext('2d');
        return new Chart(canvas, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'index',
                    callbacks: {
                        title: function (chart, data) {
                            if (!index) {
                                return data['labels'][chart[0]['index']];
                            }
                            return data['labels'][chart[0]['index']] + ' ' + options.index[data['labels'][chart[0]['index']]];
                        },
                        label: function (tooltipItem, data) {
                            var value = data['datasets'][0]['data'][tooltipItem['index']];
                            switch (format) {
                                case 'money':
                                    return 'S/ ' + appPedimap.formatNumber(value, 2, '.', ',');
                                    break;
                                case 'percentage':
                                    return appPedimap.formatNumber(value, 2, '.', ',') + '%';
                                    break;
                                default:
                                    return appPedimap.formatNumber(value, 0, '.', ',');
                                    break;
                            }
                        }
                    }
                },
                title: {
                    display: true,
                    text: title
                },
                legend: {
                    display: legend,
                    position: 'bottom'
                }
            }
        });
    }

    var sortWithIndeces = function (toSort) {
        var new_array = [];
        for (var i = 0; i < toSort.length; i++) {
            new_array.push([toSort[i], i]);
        }
        new_array.sort(function (left, right) {
            return left[0] < right[0] ? 1 : -1;
        });
        new_array.sortIndices = [];
        for (var j = 0; j < toSort.length; j++) {
            new_array.sortIndices.push(new_array[j][1]);
            new_array[j] = new_array[j][0];
        }
        return new_array;
    }

    var changeArrayOrder = function (array, newOrder) {
        if (array.length !== newOrder.length) {
            return array;
        }
        var newArray = [];
        for (var i = 0; i < array.length; i++) {
            newArray.push(array[newOrder[i]]);
        }
        return newArray;
    }

    var resetCanvas = function (options) {
        var id = options.id;
        var height = options.height === undefined ? 1200 : options.height + 100;
        var width = options.width || 800;
        var styleClass = options.styleClass !== undefined ? ('class="' + options.styleClass + '" ') : '';
        var html = '<canvas ' + styleClass + 'height="' + height + '" width="' + width + '"><canvas>';
        $('#' + id + ' canvas').remove();
        $('#' + id).html(html);
    }

    var resetChart = function (id) {
        var html = '<div class="loading"><img src="/pedimap/assets/images/ajax-loader.gif"></div>';
        $('#' + id).html(html);
    }

    var modalChart = function (id, cb) {
        var modal = $('#' + id);
        modal.on('shown.bs.modal', function () {
            $(this).unbind('shown.bs.modal');
            cb();
        });
        modal.modal('show');
    }

    appPedimap['resetCanvas'] = resetCanvas;
    appPedimap['resetChart'] = resetChart;
    appPedimap['modalChart'] = modalChart;

    var dataBarFormat = function (dataArray, labels, datasets) {
        var _labels = [];
        var _datasets = [];
        var _index = {};

        for (var i = 0; i < dataArray.length; i++) {
            var row = dataArray[i];
            var label = row[labels];
            if (typeof label === 'string') {
                _labels.push(row[labels]);
            } else {
                _labels.push(row[labels].value);
                _index[row[labels].value] = row[labels].name;
            }
        }

        for (var j = 0; j < datasets.length; j++) {
            var dataset = {};
            var data = [];
            dataset.label = datasets[j].label;
            dataset.backgroundColor = datasets[j].backgroundColor;
            dataset.stack = datasets[j].stack;
            for (var k = 0; k < dataArray.length; k++) {
                data.push(dataArray[k][datasets[j].id]);
            }
            dataset.data = data;
            _datasets.push(dataset);
        }

        return {
            data: {
                labels: _labels,
                datasets: _datasets
            },
            index: Object.keys(_index).length > 0 ? _index : null
        };
    }

    var dataPieFormat = function (dataArray, labels, datasets) {
        var _labels = [];
        var _datasets = [];

        for (var i = 0; i < dataArray.length; i++) {
            var row = dataArray[i];
            _labels.push(row[labels]);
        }

        for (var j = 0; j < datasets.length; j++) {
            var dataset = {};
            var data = [];
            dataset.backgroundColor = datasets[j].backgroundColor;
            for (var k = 0; k < dataArray.length; k++) {
                data.push(dataArray[k][datasets[j].id]);
            }
            dataset.data = data;
            _datasets.push(dataset);
        }

        return {
            labels: _labels,
            datasets: _datasets
        };
    }


})();