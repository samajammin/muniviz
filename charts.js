// var dowChart = dc.rowChart("#dow-chart");
//var monthRingChart   = dc.pieChart("#chart-ring-month");
//var sensorRingChart   = dc.pieChart("#chart-ring-sensor");
// var hourPie = dc.pieChart("#hour-pie");
//var singleHourRingChart   = dc.pieChart("#singlehour-ring-chart");
//var datatable = dc.dataTable("#dc-data-table");
//var hoursChart  = dc.lineChart("#chart-line-soundperhour");
//var hodChart = dc.barChart('#hod-chart');
// var sensorBubbleChart = dc.bubbleChart('#sensor-bubble-chart');
// var dateBarChart  = dc.barChart("#date-chart");
// var activeHours;
var volumeChart = dc.barChart('#monthly-volume-chart');
var dataTable = dc.dataTable("#table-chart");
var purposeChart = dc.rowChart("#purpose-chart");

  // sample issuance

  // {
  //   "_index": "issuances",
  //   "_type": "issuance",
  //   "_id": "6008",
  //   "_score": 1,
  //   "_source": {
  //       "id": 6008,
  //       "jurisdiction_id": "country:us/state:ca/county:san_mateo/school_district:las_lomitas_elementary",
  //       "jurisdiction_name": "Las Lomitas Elementary",
  //       "closingDate": null,
  //       "datedDate": "2002-07-01",
  //       "description": "Election Of 2001",
  //       "firstExecutionTime": null,
  //       "formalAwardTime": null,
  //       "issuerID": 2221,
  //       "msrbID": "MS130113",
  //       "msrbURL": "http://emma.msrb.org/IssueView/IssueDetails.aspx?id=MS130113",
  //       "officialStatementUrl": "http://emma.msrb.org//MS194930-MS170238-MD329739.pdf",
  //       "preliminaryOfficialStatementUrl": null,
  //       "totalAmount": 12000000,
  //       "federallyTaxable": null,
  //       "projectName": null,
  //       "sourceOfRepayment": null,
  //       "purpose": null,
  //       "trustee": null,
  //       "debtType": null,
  //       "saleType": null,
  //       "isRefunding": false,
  //       "refundingPercent": null,
  //       "isCallable": null,
  //       "hasCreditEnhancement": null
  //       }
  //   }

d3.json("http://search.neighborly.com/issuances/_search?size=1000", function(data){
  var results = data['hits']['hits'];
  var cf = crossfilter(results);
  results.forEach(function(d) {
    if (d._source.datedDate){
        d.saleDate = new Date(d._source.datedDate);
        d.saleMonth = d.saleDate.getMonth();
        d.saleYear = d.saleDate.getFullYear();
        d.totalAmount = d._source.totalAmount;
        d.val = 1;
    }
  });


    var totalIssuances = cf.groupAll().value();
    d3.select("#total").text(totalIssuances);
    d3.select("#active").text(totalIssuances);

    // function reduceInitial() {
    //     return { count: 0, total: 0};
    // }
    //
    // function reduceAdd(p, v) {
    //     p.total += v._source.totalAmount;
    //     p.count += 1;
    //     return p;
    // }
    //
    // function reduceRemove(p, v) {
    //     p.total -= v._source.totalAmount;
    //     p.count -= 1;
    //     return p;
    // }

    // <!-- todo clean up dimensions, all in one place & only the ones we need -->
    // var issuancesBySaleDate = cf.dimension(function(d) { return d._source.datedDate; });
    var issuancesBySaleDate = cf.dimension(function(d) { return d.saleDate; });
    var issuancesBySaleYear = cf.dimension(function(d) { return d.saleYear; });
    var issuancesById = cf.dimension(function(d) { return d._source.msrbID; });
    var issuancesByPurpose = cf.dimension(function(d) { return d._source.purpose; });
    // var issuancesByCounty = cf.dimension(function(d) { return d[11]; });
    // var issuancesByIssuer = cf.dimension(function(d) { return d[17]; });
    // var issuancesByPurpose = cf.dimension(function(d) { return d[24]; });
    var minDate = issuancesBySaleDate.bottom(2)[1].saleDate;
    var maxDate = issuancesBySaleDate.top(1)[0].saleDate;
    var issuanceSumBySaleDate = issuancesBySaleDate.group().reduceSum(function(d) {return d.totalAmount;});
    var issuanceCountBySaleYear = issuancesBySaleYear.group().reduceCount(function(d) {return d.totalAmount;});
    var issuanceSumByPurpose = issuancesByPurpose.group().reduceSum(function(d) {return d.totalAmount;});



// CHARTS!

    volumeChart
        // .width(1000)
        .width($( "#monthly-volume-chart-col" ).width())
        .height(300)
        .margins({top: 10, right: 100, bottom: 30, left: 100})
        .dimension(issuancesBySaleDate)
        // .dimension(issuancesBySaleYear)
        .group(issuanceSumBySaleDate)
        // .group(issuanceCountBySaleYear)
        .round(dc.round.floor)
        // .alwaysUseRounding(true)
        .brushOn(true)
        .x(d3.time.scale().domain([minDate,maxDate]))
        // .y(d3.scale.linear().domain([60, 90]))
        //.filter([d3.time.month(parseHour("2015-02-14T00:23:50")),d3.time.month(parseHour("2015-03-14T00:23:50"))])
        //.legend(dc.legend().x(50).y(10).itemHeight(13).gap(5))
        //.elasticY(true)
        .gap(10);
        // .colors(["#424242"])
        // .yAxisLabel("Decibels");

            //#### Bar Chart
            // Create a bar chart and use the given css selector as anchor. You can also specify
            // an optional chart group for this chart to be scoped within. When a chart belongs
            // to a specific group then any interaction with such chart will only trigger redraw
            // on other charts within the same chart group.
            /* dc.barChart('#volume-month-chart') */
        purposeChart
            .width($( "#purpose-chart-col" ).width())
            .height(300)
            .margins({top: 10, left: 20, right: 10, bottom: 20})
            .group(issuanceSumByPurpose)
            .dimension(issuancesByPurpose)
            .label(function (p) {
                if (p.key) {
                  return p.key;
                }
                return "Null"
            })
            .renderTitle(true)
            .title(function (p) {
                return "Issuance By Purpose";
            })
            //.x(d3.scale.linear().range([0,300]).domain([70,80]))
            .elasticX(true)
            .xAxis().ticks(5);

        dataTable
            .width($( "#table-chart" ).width())
            .height(800)
            .dimension(issuancesById)
            .group(function(d) { return "Issuance Detail"})
            .size(30)
            .columns([
                function(d) { return d._source.datedDate; },
                function(d) { return '<a href= \"https://pro.neighborly.com/' + d._source.jurisdiction_id + '\" target=\"_blank\">' + d._source.jurisdiction_name + '</a>'; },
                function(d) { return d._source.totalAmount; },
                function(d) { return '<a href= "' + d._source.msrbURL + '" target=\"_blank\">' + d._source.description + '</a>'; }
            ])
            .sortBy(function(d){ return d._source.datedDate; })
            .order(d3.descending);

        dc.renderAll();
    });

    // volumeChart.valueAccessor(function(p) {return p.value.avg; });
    // volumeChart.xUnits(function(){return 60;});

//
//      purposeChart
//            .width($( "#dow-chart-col" ).width())
//            .height(300)
//            .margins({top: 10, left: 20, right: 10, bottom: 20})
//            .group(dowAvg)
//            .dimension(dowDim)
//            .label(function (d) {
//                return dayOfWeekNames[d.key];
//              })
//             .colors(colorbrewer.SdSc[5])
//             .colorDomain([50, 100])
//             .colorAccessor(function(d){return d.value.avg;})
//             .renderTitle(true)
//             .title(function (p) {
//                 return 'Average Noise: ' + numberFormat(p.value.avg) + ' dB';
//             })
//            .elasticX(true)
//            .xAxis().ticks(4);
//
//      dowChart.valueAccessor(function(p) {return p.value.avg; });
//
//
// //
// //    dowChart
// //          .width($( "#dow-chart-col" ).width())
// //          //.height($( "#dow-chart" ).height())
// //          .height(300)
// //          .margins({top: 10, left: 20, right: 10, bottom: 20})
// ////              .group(dowDim.group())
// //          .group(dowAvg)
// //          .dimension(dowDim)
// //          .label(function (d) {
// //              return dayOfWeekNames[d.key];
// //          })
// //            .colors(colorbrewer.SdSc[5])
// //            .colorDomain([74, 76])
// //            .renderTitle(true)
// //            .title(function (p) {
// //                return 'Average Noise: ' + numberFormat(p.value.avg) + ' dB';
// //            })
// //            .labelOffsetX(2100)
// //            .colorAccessor(function(d, i){return d.value.avg;})
// //            //had to hack around to get xaxis scale to work:
// //            //https://groups.google.com/forum/#!topic/dc-js-user-group/zg_MgogXs2Y
// //            .x(d3.scale.linear().range([0,300]).domain([70,80]))
// //
// //          //.elasticX(true)
// //          .xAxis().ticks(5);
// //
// //    dowChart.valueAccessor(function(p) {return p.value.avg; });
//
//     //monthRingChart
//     //    .width(300).height(300)
//     //    .dimension(monthDim)
//     //    .group(monthDim.group())
//     //    .label(function (d) {
//     //      return monthOfYear[d.key];
//     //    })
//     //    .innerRadius(30);
//     //
//     //sensorRingChart
//     //    .width(300).height(300)
//     //    .dimension(sensorDim)
//     //    .group(sensorDim.group())
//     //    .innerRadius(60);
//
//
//     hourPie
//         //.width(275)
//         .width($( "#hour-pie-col" ).width())
//         .height(300)
//         .dimension(hourGroupDim)
//         .group(hourGroup)
//         .innerRadius(30)
//         //.colors(colorbrewer.RdBu[8])
//         .colors(colorbrewer.SdSc[5])
//         .colorDomain([74, 76.5])
//         .label(function (d) {
//               return hodBuckets[d.key];
//           })
//         .renderTitle(true)
//         .title(function (p) {
//             return [
//                 p.key,
//                 'Average Noise: ' + numberFormat(p.value.avg) + ' dB'
//             ].join('\n');
//         })
//         //.order(d3.ascending)
//         .colorAccessor(function(d, i){return d.value.avg;});
//
//
//
//     hourPie.valueAccessor(function(p) {return p.value.avg; });
//     //hourPie.sort(d3.ascending);
//
//     //singleHourRingChart
//     //    .width(300).height(300)
//     //    .dimension(hodDim.group())
//     //    .group(hodGroup)
//     //    .innerRadius(30)
//     //    .colors(colorbrewer.RdBu[8])
//     //    //.colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
//     //    // (optional) define color domain to match your data domain if you want to bind data or color
//     //    .colorDomain([74, 76])
//     //    .renderTitle(true) // (optional) whether chart should render titles, :default = false
//     //    .renderLabel(true)
//     //    .title(function (p) {
//     //        return [
//     //            p.key,
//     //            'Average Noise: ' + numberFormat(p.value.avg) + ' dB'
//     //        ].join('\n');
//     //    })
//     //    // (optional) define color value accessor
//     //    .colorAccessor(function(d, i){return d.value.avg;});
//     //
//     //singleHourRingChart.valueAccessor(function(p) {return p.value.avg; });
//
//
//
//
//     dateBarChart
//         // .width(600)
//         // .width($( "#date-chart-col" ).width())
//         .height(300)
//         //.margins({top: 10, right: 50, bottom: 30, left: 40})
//         .dimension(dateDim)
//         .group(dateAvg)
//         .round(dc.round.floor)
//         .alwaysUseRounding(true)
//         .brushOn(true)
//         .x(d3.time.scale().domain([minDate,maxDate]))
//         .y(d3.scale.linear().domain([60, 90]))
//         //.filter([d3.time.month(parseHour("2015-02-14T00:23:50")),d3.time.month(parseHour("2015-03-14T00:23:50"))])
//         //.legend(dc.legend().x(50).y(10).itemHeight(13).gap(5))
//         //.elasticY(true)
//         .gap(3)
//         .colors(["#424242"])
//         .yAxisLabel("Decibels");
//
//     dateBarChart.valueAccessor(function(p) {return p.value.avg; });
//
//
//         // customize the filter displayed in the control span
//         //.filterPrinter(function (filters) {
//         //    var filter = filters[0], s = '';
//         //    s += numberFormat(filter[0]) + '% -> ' + numberFormat(filter[1]) + '%';
//         //    return s;
//         //});
//
//     // Customize axis
//     //fluctuationChart.xAxis().tickFormat(
//     //    function (v) { return v + '%'; });
//     //fluctuationChart.yAxis().ticks(5);
//
//     dateBarChart.xUnits(function(){return 60;});
//
// //            var tableGroup = monthDim.group().reduce(
// //              function reduceAddAvg(p,v) {
// //                p[v.status] = v.hits;
// //                p["Year"]= v.Year;
// //                return p;
// //              },
// //              function reduceRemoveAvg(p,v) {
// //                p[v.status] = 0;
// //                p["Year"]=v.Year;
// //
// //                return p;
// //              },
// //              function reduceInitialAvg() { return {}; }
// //              );
//
//
//
//     //datatable
//     //    .dimension(hourDim)
//     //    .group(function(d) {return d.hour;})
//     //    // dynamic columns creation using an array of closures
//     //    .columns([
//     //        function(d) {return d.hour;},
//     //        function(d) {return d.sound_avg;},
//     //        function(d) {return d.sound_max;},
//     //        function(d) {return d.sound_min;},
//     //        function(d) {return d.sound_count;}
//     //    ]);
//
//
//
//
//
//
// <!-- todo get brush filter working -->
// //    hoursChart
// //        .width(1000).height(300)
// //        .dimension(hourDim)
// //        //.brushOn(true)
// //        .group(hourAvg)
// //        .x(d3.time.scale().domain([minHour,maxHour]))
// //        .y(d3.scale.linear().domain([60, 90]))
// //        //.compose([
// //            //dc.lineChart(hoursChart).group(hourAvg, "Avg"),
// //            //dc.lineChart(hoursChart).group(soundMax, "Max"),
// //            //dc.lineChart(hoursChart).group(soundMin, "Min")
// ////                    dc.lineChart(hoursChart).group(soundCount, "Count")
// ////        ])
// //        .legend(dc.legend().x(950).y(10).itemHeight(13).gap(5))
// //            //                    todo elastic X doesn't work, I assume due to domain set to minHour/maxHour
// //        .elasticX(true)
// //        //.elasticY(true)
// //        .yAxisLabel("Decibels");
// ////                .xAxisLabel("Date");
// //
// //    //todo this type of chart must work differently with value (multiple lines)
// //    hoursChart.valueAccessor(function(p) {return p.value.avg; });
//
//
//     //#### Bubble Chart
//     //Create a bubble chart and use the given css selector as anchor. You can also specify
//     //an optional chart group for this chart to be scoped within. When a chart belongs
//     //to a specific group then any interaction with such chart will only trigger redraw
//     //on other charts within the same chart group.
//     /* dc.bubbleChart('#yearly-bubble-chart', 'chartGroup') */
//     //    todo figure out .colr/ key /value accessors
//     sensorBubbleChart
//         //.width(360) // (optional) define chart width, :default = 200
//         .width($( "#bubble-chart-col" ).width())
//         .height(300)  // (optional) define chart height, :default = 200
//         .transitionDuration(1500) // (optional) define chart transition duration, :default = 750
//         .margins({top: 10, right: 50, bottom: 30, left: 40})
//         .dimension(sensorDim)
//         //Bubble chart expect the groups are reduced to multiple values which would then be used
//         //to generate x, y, and radius for each key (bubble) in the group
//         .group(sensorAvg)
//         //.colors(colorbrewer.RdYlGn[9]) // (optional) define color function or array for bubbles
//         //.colorDomain([70, 90]) //(optional) define color domain to match your data domain if you want to bind data or
//         .colors(colorbrewer.SdSc[5]) // (optional) define color function or array for bubbles
//         .colorDomain([70, 90]) //(optional) define color domain to match your data domain if you want to bind data or
//         //##### Accessors
//         //Accessor functions are applied to each value returned by the grouping
//         //
//         //* `.colorAccessor` The returned value will be mapped to an internal scale to determine a fill color
//         //* `.keyAccessor` Identifies the `X` value that will be applied against the `.x()` to identify pixel location
//         //* `.valueAccessor` Identifies the `Y` value that will be applied agains the `.y()` to identify pixel location
//         //* `.radiusValueAccessor` Identifies the value that will be applied agains the `.r()` determine radius size,
//         //*     by default this maps linearly to [0,100]
//         .colorAccessor(function (d) {
//             return d.value.avg;
//         })
//         .keyAccessor(function (p) {
//             return p.value.avg;
//         })
//         .valueAccessor(function (p) {
//             return p.value.std_avg;
//         })
//         .radiusValueAccessor(function (p) {
//             return p.value.count/2;
//         })
//         .maxBubbleRelativeSize(0.3)
//         .x(d3.scale.linear().domain([70, 90]))
//         .y(d3.scale.linear().domain([45, 65]))
//         .r(d3.scale.linear().domain([0, 4000]))
//         //.elasticY(true)
//         //.elasticX(true)
//         .yAxisPadding(100)
//         .xAxisPadding(500)
//         .renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
//         .renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false
//         .xAxisLabel('Decibels') // (optional) render an axis label below the x axis
//         .yAxisLabel('Standard Deviation') // (optional) render a vertical axis lable left of the y axis
//         .renderLabel(true) // (optional) whether chart should render labels, :default = true
//         .label(function (p) {
//             return p.key;
//         })
//         .renderTitle(true) // (optional) whether chart should render titles, :default = false
//         .title(function (p) {
//             return [
//                 'Sensor: ' + p.key,
//                 'Average Noise: ' + numberFormat(p.value.avg) + ' dB',
//                 'Noise STD: ' + numberFormat(p.value.std_avg),
//                 'Total Measurements: ' + numberFormat(p.value.count)
//             ].join('\n');
//         })
//         .yAxis()
//             .tickFormat(function (v) {
//             return v;
//         });
