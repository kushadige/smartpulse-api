/**
 * smartPulse API
 * API for fetching data from the given URL
 * 
 * @author oguzhankuslar
 *  
 **/

let startDate = '2022-01-26';
let endDate = '2022-01-26';

const http = new XMLHttpRequest;

http.open('GET', `https://seffaflik.epias.com.tr/transparency/service/market/intra-day-trade-history?endDate=${endDate}&startDate=${startDate}`, true);

http.onload = function(){
    if(this.readyState === 200){
        const res = JSON.parse(this.responseText);
        
        // 'PB' ile baslamayan conractlarin eklenecegi liste
        let groupWithoutPB = [];

        function makeGroup(list, callback){
            // 'PB' ile baslamayan liste elemanlarını groupWithoutPB isimli arraye ata
            list.forEach((element) => {
                if(!element.conract.startsWith('PB')){
                    groupWithoutPB.push(element);
                }
            });

            // Atama islemi tamamlandiktan sonra ilgili fonksiyonu cagir
            callback();
        }

        // Call makeGroup with fetched list
        makeGroup(res.body.intraDayTradeHistoryList, function(){

            // Listedeki sınıfları conract değerlerine göre gruplandır
            let group = groupWithoutPB.reduce((r, a) => {
                r[a.conract] = [...r[a.conract] || [], a];
                return r;
               }, {});
            
            let toplamIslemMiktari = 0;
            let toplamIslemTutari = 0;
            let agirlikliOrtFiyat = 0;
            let output = '';
        
            // Group objesini array'e dönüştür. Döngüyle her elemanı tara (her elemanı bir conract array'dir)
            Object.entries(group).forEach((conractArr) => {
                
                // Conract arrayin içindeki price ve quantity degerleriyle gerekli islemleri yap
                conractArr[1].forEach((el) => {
                    toplamIslemTutari += (el.price * el.quantity)/10;
                    toplamIslemMiktari += (el.quantity)/10;
                });
                agirlikliOrtFiyat = toplamIslemTutari / toplamIslemMiktari;
        
                // Ilgili conracti Date formatina ata. Conract Example: "PH22012704"
                let date = new Date();
                date.setFullYear(2000 + parseInt(conractArr[0].substring(2,4)));
                date.setMonth(parseInt(conractArr[0].substring(4,6)));
                date.setDate(parseInt(conractArr[0].substring(6,8)));
                date.setHours(parseInt(conractArr[0].substring(8,10)));
        
                // Conractin istenilen tarih formatina cevirilmesi. Ornek: "7.02.2022 03:00"
                let outputDate = date.getDate() + '.' + ('0' + date.getMonth()).slice(-2) + '.' + date.getFullYear() + ' ' + ('0' + date.getHours()).slice(-2) + ':00';

                // Elde ettigimiz Tarih - toplamIslemMiktari - toplamIslemTutari - agirlikliOrtFiyat degerlerini
                // her iterasyonda output stringine topluyoruz
                output += `
                    <tr>
                        <td>${outputDate}</td>
                        <td>${toplamIslemMiktari.toFixed(2)}</td>
                        <td>${toplamIslemTutari.toFixed(2)}</td>
                        <td>${agirlikliOrtFiyat.toFixed(2)}</td>
                    </tr>
                `;
                
                toplamIslemMiktari = 0;
                toplamIslemTutari = 0;
                agirlikliOrtFiyat = 0;
            });
            
            // Tum iterasyonlar tamamlandiktan sonra elde ettigimiz output html stringini ilgili tabloya aktariyoruz.
            document.getElementById('list').innerHTML = output;
        });
    }
};

http.send();
