/**
 * smartPulse API
 * API for fetching data from the given URL
 * 
 * @author oguzhankuslar
 *  
 **/

 let startDate = '2022-01-24';
 let endDate = '2022-01-26';
 
 fetch(`https://seffaflik.epias.com.tr/transparency/service/market/intra-day-trade-history?endDate=${endDate}&startDate=${startDate}`)
     .then((res) => {
         return res.json();
     }).then((resjson) => {
         console.log(resjson.body.intraDayTradeHistoryList);
 
         let groupWithoutPB = [];
 
         function makeGroup(list, callback){
             list.forEach((element) => {
                 if(!element.conract.startsWith('PB')){
                     groupWithoutPB.push(element);
                 }
             });
 
             callback();
         }
 
         makeGroup(resjson.body.intraDayTradeHistoryList, () => {
             let group = groupWithoutPB.reduce((r, a) => {
                 r[a.conract] = [...r[a.conract] || [], a];
                 return r;
             }, {}); 
 
             let toplamIslemMiktari = 0;
             let toplamIslemTutari = 0;
             let agirlikliOrtFiyat = 0;
             let output = '';
 
             Object.entries(group).forEach((conractArr) => {
                 conractArr[1].forEach((el) => {
                     toplamIslemTutari += (el.price * el.quantity)/10;   
                     toplamIslemMiktari += (el.quantity)/10;
                 }); 
 
                 agirlikliOrtFiyat = toplamIslemTutari / toplamIslemMiktari;
 
                 let date = new Date();
                 date.setFullYear(2000 + parseInt(conractArr[0].substring(2,4)));
                 date.setMonth(parseInt(conractArr[0].substring(4,6)));
                 date.setDate(parseInt(conractArr[0].substring(6,8)));
                 date.setHours(parseInt(conractArr[0].substring(8,10)));
 
                 let outDate = date.getDate() + '.' + ('0' + date.getMonth()).slice(-2) + '.' + date.getFullYear() + ' ' + ('0' + date.getHours()).slice(-2) + ':00';
 
                 output += `
                     <tr>
                         <td>${outDate}</td>
                         <td>${toplamIslemMiktari.toFixed(2)}</td>
                         <td>${toplamIslemTutari.toFixed(2)}</td>
                         <td>${agirlikliOrtFiyat.toFixed(2)}</td>
                     </tr>
                 `;
 
                 toplamIslemMiktari = 0;
                 toplamIslemTutari = 0;
                 agirlikliOrtFiyat = 0;
             });
 
             let html = `
             <body>
                 <div class="container">
                     <table>
                         <thead>
                             <tr>
                                 <th>Tarih</th>
                                 <th>Toplam ????lem Miktari (MWh)</th>
                                 <th>Toplam ????lem Tutar?? (TL)</th>
                                 <th>A????rl??kl?? Ortalama Fiyat (TL/Mwh)</th>
                             </tr>
                         </thead>
                         <tbody id="list">${output}</tbody>
                     </table>
                 </div>
             </body>
             `;
 
             document.head.innerHTML = `
             <head>
                 <style>
                     * {
                         box-sizing: border-box;
                     }
 
                     body {
                         font-family: Arial, Helvetica, sans-serif;
                     }
                     
                     table {
                         width: 90%;
                         padding: 0px 200px;
                         margin: auto;
                         text-align: right;
                     }
             
                     table thead tr th {
                         font-size: large;
                         color: #fff;
                         background: #1c579a;
                         padding: 10px 5px;
                         text-align: right;
                     }
             
                     table td, th {
                         border: 1px solid #ddd;
                         padding: 5px 10px;
                     }
             
                     table tr:nth-child(odd) {
                         background: #b0c5dd;
                     }
                 </style>
             </head>
             `;
             document.body.innerHTML = html;
         });
     });