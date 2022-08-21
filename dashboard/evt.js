import { appSounds, SystemPrefs, CEDIS, pop, popCountries,  Swiper, thousandsSeperator, Notif, footerBottomCustomText, AuditLogs } from '../assets/js/utils.js'
import { pageRights } from '../assets/js/event.js';
import ApexCharts from '../assets/plugins/apexcharts.esm.js'
import { DateTime, Duration, FixedOffsetZone, IANAZone, Info, Interval, InvalidZone, Settings, SystemZone, VERSION, Zone } from '../assets/plugins/luxon.js'
// console.log(DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'));
import { TabulatorFull as Tabulator } from '../assets/plugins/tabulator-master/dist/js/tabulator_esm.min.js';

console.log(pageRights);

const notif = new Notif(), systemPrefs = new SystemPrefs()

// console.log(DateTime.local().month, $(`.swiper#years .swiper-wrapper .swiper-slide:contains(${DateTime.local().year})`).index());
const yearsSwiper = new Swiper('.swiper#years', {
        speed: 400,
        spaceBetween: 10,
        // navigation: false,
        slidesPerView: 1,
        slideActiveClass: 'period-active',
        slideToClickedSlide: true,
        // centeredSlides: true,
        // initialSlide: $(`.swiper#years .swiper-wrapper .swiper-slide:contains(${DateTime.now().year})`).index(),
        breakpoints: {
            480: {
                slidesPerView: 2
            },
        },
        on: {
            init: swiper => {
                // console.log(swiper); 
                for (let y = 2015; y <= DateTime.now().year; y++) {
                    swiper.appendSlide(`<button type="button" class="swiper-slide">${y}</button>`);
                }
                swiper.update();   
                swiper.slideTo($(`.swiper#years .swiper-wrapper .swiper-slide`).length);            
                swiper.slideNext()
            },
            click: swiper => {
                // console.log(swiper);
            },
            reachEnd: function() {
                this.snapGrid = [...this.slidesGrid];
            },
        }
    }),
    monthsSwiper = new Swiper('.swiper#months', {
        speed: 400,
        spaceBetween: 10,
        // navigation: false,
        slidesPerView: 1,
        // centeredSlides: true,
        slideActiveClass: 'period-active',
        slideToClickedSlide: true,
        // shortSwipes: false,
        breakpoints: {
            480: {
                slidesPerView: 2
            },
            640: {
                slidesPerView: 3
            },
            957: {
                slidesPerView: 6
            },
        },
        on: {
            init: swiper => {
                // console.log(swiper);        
                _.forEach(Info.months(), (month, i) => {
                    swiper.appendSlide(`<button type="button" class="swiper-slide">${month}</button>`);
                }); 
                swiper.update();   
                swiper.slideTo(DateTime.now().month-1);     
            },
            reachEnd: function() {
                this.snapGrid = [...this.slidesGrid];
            },
        }
    }),
    dashboxSwiper = new Swiper('.swiper#cards', {
        speed: 400,
        spaceBetween: 20,
        // navigation: false,
        slidesPerView: 'auto',         
        breakpoints: {
            0: {
                slidesPerView: 'auto'
            },
            480: {
                slidesPerView: 2
            },
            1080: {
                slidesPerView: 3
            },
            1280: {
                slidesPerView: 4
            },
        }                  
    });



var data = {"prices":[7114.25,7126.6,7116.95,7203.7,7233.75,7451.0,7381.15,7348.95,7347.75,7311.25,7266.4,7253.25,7215.45,7266.35,7315.25,7237.2,7191.4,7238.95,7222.6,7217.9,7359.3,7371.55,7371.15,7469.2,7429.25,7434.65,7451.1,7475.25,7566.25,7556.8,7525.55,7555.45,7560.9,7490.7,7527.6,7551.9,7514.85,7577.95,7592.3,7621.95,7707.95,7859.1,7815.7,7739.0,7778.7,7839.45,7756.45,7669.2,7580.45,7452.85,7617.25,7701.6,7606.8,7620.05,7513.85,7498.45,7575.45,7601.95,7589.1,7525.85,7569.5,7702.5,7812.7,7803.75,7816.3,7851.15,7912.2,7972.8,8145.0,8161.1,8121.05,8071.25,8088.2,8154.45,8148.3,8122.05,8132.65,8074.55,7952.8,7885.55,7733.9,7897.15,7973.15,7888.5,7842.8,7838.4,7909.85,7892.75,7897.75,7820.05,7904.4,7872.2,7847.5,7849.55,7789.6,7736.35,7819.4,7875.35,7871.8,8076.5,8114.8,8193.55,8217.1,8235.05,8215.3,8216.4,8301.55,8235.25,8229.75,8201.95,8164.95,8107.85,8128.0,8122.9,8165.5,8340.7,8423.7,8423.5,8514.3,8481.85,8487.7,8506.9,8626.2],"dates":["02 Jun 2017","05 Jun 2017","06 Jun 2017","07 Jun 2017","08 Jun 2017","09 Jun 2017","12 Jun 2017","13 Jun 2017","14 Jun 2017","15 Jun 2017","16 Jun 2017","19 Jun 2017","20 Jun 2017","21 Jun 2017","22 Jun 2017","23 Jun 2017","27 Jun 2017","28 Jun 2017","29 Jun 2017","30 Jun 2017","03 Jul 2017","04 Jul 2017","05 Jul 2017","06 Jul 2017","07 Jul 2017","10 Jul 2017","11 Jul 2017","12 Jul 2017","13 Jul 2017","14 Jul 2017","17 Jul 2017","18 Jul 2017","19 Jul 2017","20 Jul 2017","21 Jul 2017","24 Jul 2017","25 Jul 2017","26 Jul 2017","27 Jul 2017","28 Jul 2017","31 Jul 2017","01 Aug 2017","02 Aug 2017","03 Aug 2017","04 Aug 2017","07 Aug 2017","08 Aug 2017","09 Aug 2017","10 Aug 2017","11 Aug 2017","14 Aug 2017","16 Aug 2017","17 Aug 2017","18 Aug 2017","21 Aug 2017","22 Aug 2017","23 Aug 2017","24 Aug 2017","28 Aug 2017","29 Aug 2017","30 Aug 2017","31 Aug 2017","01 Sep 2017","04 Sep 2017","05 Sep 2017","06 Sep 2017","07 Sep 2017","08 Sep 2017","11 Sep 2017","12 Sep 2017","13 Sep 2017","14 Sep 2017","15 Sep 2017","18 Sep 2017","19 Sep 2017","20 Sep 2017","21 Sep 2017","22 Sep 2017","25 Sep 2017","26 Sep 2017","27 Sep 2017","28 Sep 2017","29 Sep 2017","03 Oct 2017","04 Oct 2017","05 Oct 2017","06 Oct 2017","09 Oct 2017","10 Oct 2017","11 Oct 2017","12 Oct 2017","13 Oct 2017","16 Oct 2017","17 Oct 2017","18 Oct 2017","19 Oct 2017","23 Oct 2017","24 Oct 2017","25 Oct 2017","26 Oct 2017","27 Oct 2017","30 Oct 2017","31 Oct 2017","01 Nov 2017","02 Nov 2017","03 Nov 2017","06 Nov 2017","07 Nov 2017","08 Nov 2017","09 Nov 2017","10 Nov 2017","13 Nov 2017","14 Nov 2017","15 Nov 2017","16 Nov 2017","17 Nov 2017","20 Nov 2017","21 Nov 2017","22 Nov 2017","23 Nov 2017","24 Nov 2017","27 Nov 2017","28 Nov 2017"]}

var monthDataSeries1 = {
  "prices":[8107.85,8128.0,8122.9,8165.5,8340.7,8423.7,8423.5,8514.3,8481.85,8487.7,8506.9,8626.2,8668.95,8602.3,8607.55,8512.9,8496.25,8600.65,8881.1,9340.85],
  "dates":["13 Nov 2017","14 Nov 2017","15 Nov 2017","16 Nov 2017","17 Nov 2017","20 Nov 2017","21 Nov 2017","22 Nov 2017","23 Nov 2017","24 Nov 2017","27 Nov 2017","28 Nov 2017","29 Nov 2017","30 Nov 2017","01 Dec 2017","04 Dec 2017","05 Dec 2017","06 Dec 2017","07 Dec 2017","08 Dec 2017"]
}

var monthDataSeries2 = {
  "prices":[8423.7,8423.5,8514.3,8481.85,8487.7,8506.9,8626.2,8668.95,8602.3,8607.55,8512.9,8496.25,8600.65,8881.1,9040.85,8340.7,8165.5,8122.9,8107.85,8128.0]
}

// Apex.grid = {
//     padding: {
//       right: 0,
//       left: 0
//     }
// }
  
// Apex.dataLabels = {
//     enabled: false
// }

// Apex.theme = {
//     mode: 'dark',
// }
  
var randomizeArray = arg => {
    var array = arg.slice();
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }  
    return array;
}
  
// data for the sparklines that appear below header area
var sparklineData = [47, 45, 54, 38, 56, 24, 65, 31, 37, 39, 62, 51, 35, 41, 35, 27, 93, 53, 61, 27, 54, 43, 19, 46];

// the default colorPalette for this dashboard
//var colorPalette = ['#01BFD6', '#5564BE', '#F7A600', '#EDCD24', '#F74F58'];
var colorPalette = ['#00D8B6','#008FFB',  '#FEB019', '#FF4560', '#775DD0']
  
let optsDashboardTotals = params => {
    return {
        chart: {
        id: params.id,
          type: "area",
          height: 300,
          foreColor: "#999",
          dropShadow: {
            enabled: true,
            // enabledSeries: [0],
            top: -2,
            left: 2,
            blur: 5,
            opacity: 0.06
          }
        },
        colors: [params.color],
        stroke: {
          curve: "smooth",
          width: 3
        },
        dataLabels: {
          enabled: false
        },
        series: [{
        //   name: params.name,
          data: []
        }],
        markers: {
          size: 0,
          strokeColor: "#fff",
          strokeWidth: 3,
          strokeOpacity: 1,
          fillOpacity: 1,
          hover: {
            size: 6
          }
        },
        xaxis: {
            // type: "datetime",
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            },
            labels: {
                trim: true
            }
        },
        yaxis: {
            labels: {
                offsetX: -20,
                offsetY: -5
            },
            tooltip: {
                enabled: true
            }
        },
        grid: {
            padding: {
                left: -5,
                right: 5,
                bottom: -10,
            }
        },
        tooltip: {
            x: {
                format: "MMM"
            },
        },
        legend: {
            position: 'top',
            horizontalAlign: 'left'
        },
        fill: {
            type: "solid",
            fillOpacity: 0.7
        },
        title: {
            text: CEDIS(0).format(),
            offsetX: -10,
            style: {
                fontSize: '24px',
                cssClass: 'apexcharts-yaxis-title',
                color: '#000'
            }
        },
        subtitle: {
            text: params.subtitle,
            offsetX: -10,
            style: {
                fontSize: '14px',
                cssClass: 'apexcharts-yaxis-title'
            }
        }
    }
},
topSellingItemsOpts = {
    chart: {
        id: 'topSellingItems',
        type: 'bar',
        height: 350,
        // stacked: true,
        toolbar: {
            show: true,
        }
    },
    plotOptions: {
        bar: {
            // columnWidth: '45%',
            horizontal: true,
            distributed: true,            
        }
    },
    colors: ['#00D8B6', '#008FFB', '#FEB019', '#FF4560', '#775DD0', '#FF9F40', '#FF00F2', '#4B0082', '#F00000', '#00FF00', '#F7A600', '#EDCD24', '#F74F58'],
    series: [],
    // labels: Info.months('short'),
    dataLabels: {
        enabled: false,
        show: false,
        distributed: false,
        formatter: function (val, opt) {
          return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
        },
        offsetX: 0,
        dropShadow: {
          enabled: true
        }
    },
    xaxis: {
        labels: {
            show: false
        },
        axisBorder: {
            show: false
        },
        axisTicks: {
            show: false
        },
    },
    yaxis: {
        labels: {
          show: false
        }
    },
    title: {
        text: 'Top Selling Items',
        align: 'left',
        // floating: true,
        style: {
            fontSize: '18px'
        }
    },
    tooltip: {
    //   theme: 'dark',
      x: {
        // show: false
      },
      y: {
        title: {
          formatter: seriesName => ''
        }
      }
    }
},
optsWeeklyDaySales = {
    chart: {
        id: 'weeklyDaySales',
        type: 'donut',
        height: 400,
        toolbar: {
            show: true,
        }
    },
    dataLabels: {
        // enabled: false,
    },
    plotOptions: {
        pie: {
            // customScale: 0.8,
            // donut: {
            //     size: '75%',
            // },
            // offsetY: 20,
            donut: {
                labels: {
                    show: true,
                    name: {
                        show: true
                    },
                    value: {
                        // offsetY: -1,
                        show: true
                    },
                    total: {
                        show: true,
                        label: 'Total',
                        color: '#373d3f',
                        formatter: w => {
                            return thousandsSeperator(_.sum(w.globals.series))
                        }
                    }
                }
            }
        },
        stroke: {
            colors: undefined
        },
    },
    colors: ['#00D8B6', '#008FFB', '#FEB019', '#FF4560', '#775DD0', '#FF00F2', '#4B0082'],
    title: {
        text: 'WeekDay Sales',
            style: {
            fontSize: '18px'
        }
    },
    series: [],
    labels: Info.weekdays('short'),
    legend: {
        position: 'bottom',
        // offsetY: 80
    }
},
optsPaymentMethodsSales = {
    chart: {
        id: 'paymentMethodsSales',
        type: 'pie',
        height: 400,
        toolbar: {
            show: true,
        }
    },
    dataLabels: {
        // enabled: false,
    },
    plotOptions: {
        pie: {
            // customScale: 0.8,
            // donut: {
            //     size: '75%',
            // },
            // offsetY: 20,
            donut: {
                labels: {
                    show: true,
                    name: {
                        show: true
                    },
                    value: {
                        // offsetY: -1,
                        show: true,
                        color: '#ffffff',
                    },
                    total: {
                        show: true,
                        label: 'Total',
                        color: '#ffffff',
                        formatter: w => {
                            return thousandsSeperator(_.sum(w.globals.series))
                        }

                    }
                }
            }
        },
        stroke: {
            colors: undefined
        },
    },
    colors: ['#581845', '#808000', '#008080', '#0000FF', '#800080', '#FF0000', '#FF00FF', '#00FF00', '#FFFF00', '#000000', '#FFFFFF'],
    title: {
        text: 'Sales By Payment Types',
            style: {
            fontSize: '18px'
        }
    },
    series: [],
    labels: Info.weekdays('short'),
    legend: {
        position: 'bottom',
        // offsetY: 80
    }
}

console.log(optsDashboardTotals({id: 'totalStocks', color: '#fafa1b', subtitle: 'Inventory'}))
  
const totalPurchases = new ApexCharts(document.querySelector("#totalPurchases"), optsDashboardTotals({id: 'totalPurchases', color: '#fafa1b', subtitle: 'Purchases'})).render(),
      totalStocks = new ApexCharts(document.querySelector("#totalStocks"), optsDashboardTotals({id: 'totalStocks', color: '#696969', subtitle: 'Inventory'})).render(),
      totalSales = new ApexCharts(document.querySelector("#totalSales"), optsDashboardTotals({id: 'totalSales', color: '#8833ff', subtitle: 'Sales'})).render(),
      totalProfits = new ApexCharts(document.querySelector("#totalProfits"), optsDashboardTotals({id: 'totalProfits', color: '#00FF00', subtitle: 'Profits'})).render(),
      totalExpenses = new ApexCharts(document.querySelector("#totalExpenses"), optsDashboardTotals({id: 'totalExpenses', color: '#F00000', subtitle: 'Expenses'})).render(),
      topSellingItems = new ApexCharts(document.querySelector('#topSellingItems'), topSellingItemsOpts).render(),
      weeklyDaySales = new ApexCharts(document.querySelector('#weeklyDaySales'), optsWeeklyDaySales).render(),
      paymentMethodsSales = new ApexCharts(document.querySelector('#paymentMethodsSales'), optsPaymentMethodsSales).render()

const popCards = params => pop(`./crud.php?dashbox&${params.query}&year=${params.year}`)
.then(resp => {
    console.log(resp.data)
    if(resp.data.totalPurchases){
        let dataset = [];
        for (let i = 1; i <= Info.months('short').length; i++) {
            let idx = _.findIndex(resp.data.totalPurchases, entry => entry.mm == i);
            dataset = [...dataset, { mm: DateTime.local(params.year, i).toFormat('MMM'), amt: idx < 0 ? 0 : _.toNumber(resp.data.totalPurchases[idx].amt) }]
        }
        ApexCharts.exec('totalPurchases', 'updateOptions', {
            title: {
                text: CEDIS(_.sumBy(resp.data.totalPurchases, entry => _.toNumber(entry.amt))).format()
            },
            series: [{
                name: 'Purchases',
                data: _.map(dataset, entry => _.toNumber(entry['amt']).toFixed(2))
            }],
            labels: _.map(dataset, entry => entry['mm']),
        });
    }
    if(resp.data.totalStocks){
        let dataset = [];
        for (let i = 1; i <= Info.months('short').length; i++) {
            let idx = _.findIndex(resp.data.totalStocks, entry => entry.mm == i);
            dataset = [...dataset, { mm: DateTime.local(params.year, i).toFormat('MMM'), amt: idx < 0 ? 0 : _.toNumber(resp.data.totalStocks[idx].amt) }]
        }
        // console.log(_.mapValues(dataset, 'amt'))
        ApexCharts.exec('totalStocks', 'updateOptions', {
            title: {
                text: CEDIS(_.sumBy(resp.data.totalStocks, entry => _.toNumber(entry.amt))).format()
            },
            series: [{
                name: 'Inventory',
                data: _.map(dataset, entry => _.toNumber(entry['amt']).toFixed(2))
            }],
            labels: _.map(dataset, entry => entry['mm']),
        });
    }
    else if(resp.data.totalSales){
        let dataset = [];
        for (let i = 1; i <= Info.months('short').length; i++) {
            let idx = _.findIndex(resp.data.totalSales, entry => entry.mm == i);
            dataset = [...dataset, { mm: DateTime.local(params.year, i).toFormat('MMM'), amt: idx < 0 ? 0 : _.toNumber(resp.data.totalSales[idx].amt) }]
        }
        ApexCharts.exec('totalSales', 'updateOptions', {
            title: {
                text: CEDIS(_.sumBy(resp.data.totalSales, entry => _.toNumber(entry.amt))).format()
            },
            series: [{
                name: 'Sales',
                data: _.map(dataset, entry => _.toNumber(entry['amt']).toFixed(2))
            }],
            labels: _.map(dataset, entry => entry['mm'])
        });
    }
    else if(resp.data.totalExpenses){
        let dataset = [];
        for (let i = 1; i <= Info.months('short').length; i++) {
            let idx = _.findIndex(resp.data.totalExpenses, entry => entry.mm == i);
            dataset = [...dataset, { mm: DateTime.local(params.year, i).toFormat('MMM'), amt: idx < 0 ? 0 : _.toNumber(resp.data.totalExpenses[idx].amt) }]
        }
        ApexCharts.exec('totalExpenses', 'updateOptions', {
            title: {
                text: CEDIS(_.sumBy(resp.data.totalExpenses, entry => _.toNumber(entry.amt))).format()
            },
            series: [{
                name: 'Expenses',
                data: _.map(dataset, entry => _.toNumber(entry['amt']).toFixed(2))
            }],
            labels: _.map(dataset, entry => entry['mm'])
        });
    }
    else if(resp.data.totalProfits){
        let dataset = [];
        for (let i = 1; i <= Info.months('short').length; i++) {
            let idx = _.findIndex(resp.data.totalProfits, entry => entry.mm == i);
            dataset = [...dataset, { mm: DateTime.local(params.year, i).toFormat('MMM'), amt: idx < 0 ? 0 : _.toNumber(resp.data.totalProfits[idx].amt) }]
        }
        ApexCharts.exec('totalProfits', 'updateOptions', {
            title: {
                text: CEDIS(_.sumBy(resp.data.totalProfits, entry => _.toNumber(entry.amt))).format()
            },
            series: [{
                name: 'Profits',
                data: _.map(dataset, entry => _.toNumber(entry['amt']).toFixed(2))
            }],
            labels: _.map(dataset, entry => entry['mm'])
        });
    }
    else if(resp.data.weeklyDaySales){
        let series = [];
        for (let i = 1; i <= Info.weekdays('short').length; i++) {
            let idx = _.findIndex(resp.data.weeklyDaySales, entry => entry.wd == i);
            series[i] = idx < 0 ? 0 : _.toNumber(resp.data.weeklyDaySales[idx].amt)
        }
        series[series.length - 1] = _.findIndex(resp.data.weeklyDaySales, entry => entry.wd == 0) > -1 ? _.toNumber(resp.data.weeklyDaySales[0].amt) : 0;
        ApexCharts.exec('weeklyDaySales', 'updateOptions', {
            series: _.filter(series, entry => _.isNumber(entry)),
        });
    }
    else if(resp.data.topSellingItems){
        // console.log(_.groupBy(resp.data.topSellingItems, 'mm'))
        _.map(resp.data.topSellingItems, (entry, i) => resp.data.topSellingItems[i] = {name: 'hello', x: _.toUpper(entry.item), y: _.toNumber(entry.UNITS_SOLD)});
        ApexCharts.exec('topSellingItems', 'updateOptions', {
            series: [{
                data: resp.data.topSellingItems
            }]
        });
    }
    else if(resp.data.paymentMethodsSales){
       ApexCharts.exec('paymentMethodsSales', 'updateOptions', {
            labels: _.map(resp.data.paymentMethodsSales, 'title'),
            series: _.map(resp.data.paymentMethodsSales, entry => _.toNumber(entry['amt'])),
        });
    }
});

// Fetch & Plot Data for Dashboard on Page Load
const fetchData = params => {
    popCards({query: "totalPurchases", year: params.year});
    popCards({query: "totalStocks", year: params.year});
    popCards({query: "totalSales", year: params.year});
    popCards({query: "totalExpenses", year: params.year});
    popCards({query: "totalProfits", year: params.year});
    popCards({query: "weeklyDaySales", year: params.year});
    popCards({query: "topSellingItems", year: params.year});
    popCards({query: "paymentMethodsSales", year: params.year});
}
fetchData({year: DateTime.local().year});

yearsSwiper.on('slideChange', function () {

}); 

$("#btnQueryPeriod").on('click', e => {
fetchData({ year: _.toNumber($(".swiper#years .swiper-wrapper .swiper-slide.period-active").text()) });
});
  
// var optionsArea = {
// chart: {
//         height: 340,
//         width: 400,
//         type: 'area',
//         zoom: {
//         enabled: false
//         },
//     },
//     stroke: {
//         curve: 'straight'
//     },
//     colors: colorPalette,
//     series: [
//         {
//         name: "Blog",
//         data: [
//             {x: 0, y: 0}, { x: 4, y: 5}, {
//             x: 5,
//             y: 3
//         }, {
//             x: 9,
//             y: 8
//         }, {
//             x: 14,
//             y: 4
//         }, {
//             x: 18,
//             y: 5
//         }, {
//             x: 25,
//             y: 0
//         }]
//         },
//         {
//         name: "Social Media",
//             data: [{
//                 x: 0,
//                 y: 0
//             }, {
//                 x: 4,
//                 y: 6
//             }, {
//                 x: 5,
//                 y: 4
//             }, {
//                 x: 14,
//                 y: 8
//             }, {
//                 x: 18,
//                 y: 5.5
//             }, {
//                 x: 21,
//                 y: 6
//             }, {
//                 x: 25,
//                 y: 0
//             }]
//             },
//         {
//         name: "External",
//         data: [{
//             x: 0,
//             y: 0
//         }, {
//             x: 2,
//             y: 5
//         }, {
//             x: 5,
//             y: 4
//         }, {
//             x: 10,
//             y: 11
//         }, {
//             x: 14,
//             y: 4
//         }, {
//             x: 18,
//             y: 8
//         }, {
//             x: 25,
//             y: 0
//         }]
//         }
//     ],
//     fill: {
//         opacity: 1,
//     },
//     title: {
//         text: 'Daily Visits Insights',
//         align: 'left',
//         style: {
//             fontSize: '18px'
//         }
//     },
//     markers: {
//         size: 0,
//         style: 'hollow',
//         hover: {
//             opacity: 5,
//         }
//     },
//     tooltip: {
//         intersect: true,
//         shared: false,
//     },
//     xaxis: {
//         tooltip: {
//             enabled: false
//         },
//         labels: {
//             show: false
//         },
//         axisTicks: {
//             show: false
//         }
//     },
//     yaxis: {
//         tickAmount: 4,
//         max: 12,
//         axisBorder: {
//             show: false
//         },
//         axisTicks: {
//             show: false
//         },
//         labels: {
//             style: {
//                 colors: '#78909c'
//             }
//         }
//     },
//     legend: {
//         show: false
//     }
// }

// var chartArea = new ApexCharts(document.querySelector('#area'), optionsArea);
// chartArea.render();

// function trigoSeries(cnt, strength) {
//     var data = [];
//     for (var i = 0; i < cnt; i++) {
//         data.push((Math.sin(i / strength) * (i / strength) + i / strength+1) * (strength*2));
//     }

//     return data;
// }

// var optionsLine = {
//     chart: {
//         width: 400,
//         height: 340,
//         type: 'line',
//         zoom: {
//         enabled: false
//         }
//     },
//     plotOptions: {
//         stroke: {
//         width: 4,
//         curve: 'smooth'
//         },
//     },
//     colors: colorPalette,
//     series: [
//         {
//         name: "Day Time",
//         data: trigoSeries(52, 20)
//         },
//         {
//         name: "Night Time",
//         data: trigoSeries(52, 27)
//         },
//     ],
//     title: {
//         floating: false,
//         text: 'Customers',
//         align: 'left',
//         style: {
//         fontSize: '18px'
//         }
//     },
//     subtitle: {
//         text: '168,215',
//         align: 'center',
//         margin: 30,
//         offsetY: 40,
//         style: {
//         color: '#222',
//         fontSize: '24px',
//         }
//     },
//     markers: {
//         size: 0
//     },

//     grid: {

//     },
//     xaxis: {
//         labels: {
//         show: false
//         },
//         axisTicks: {
//         show: false
//         },
//         tooltip: {
//         enabled: false
//         }
//     },
//     yaxis: {
//         tickAmount: 2,
//         labels: {
//         show: false
//         },
//         axisBorder: {
//         show: false,
//         },
//         axisTicks: {
//         show: false
//         },
//         min: 0,
//     },
//     legend: {
//         position: 'top',
//         horizontalAlign: 'left',
//         offsetY: -20,
//         offsetX: -30
//     }

// }

// var chartLine = new ApexCharts(document.querySelector('#line'), optionsLine);

// // a small hack to extend height in website sample dashboard
// chartLine.render().then(function () {
//     var ifr = document.querySelector("#wrapper");
//     if (ifr.contentDocument) {
//         ifr.style.height = ifr.contentDocument.body.scrollHeight + 20 + 'px';
//     }
// });
  
  
  // on smaller screen, change the legends position for donut
//   var mobileDonut = function() {
//     if($(window).width() < 768) {
//       donut.updateOptions({
//         plotOptions: {
//           pie: {
//             offsetY: -15,
//           }
//         },
//         legend: {
//           position: 'bottom'
//         }
//       }, false, false)
//     }
//     else {
//       donut.updateOptions({
//         plotOptions: {
//           pie: {
//             offsetY: 20,
//           }
//         },
//         legend: {
//           position: 'left'
//         }
//       }, false, false)
//     }
//   }
  
//   $(window).on('resize', function() {
//     mobileDonut()
//   });

    



