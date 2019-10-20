//處理資料
var dataController = (function () {

    let bodyData = function (id, height, weight) {
        this.id = id;
        this.height = height;
        this.weight = weight;
    };

    bodyData.prototype.today = function () {
        var now, year, month, day;
        var now = new Date()
        year = now.getFullYear();
        month = now.getMonth();
        day = now.getDate()

        return this.date = `${month}-${day}-${year}`
    };

    bodyData.prototype.calcBmi = function () {
        let height = this.height;
        height = height * 0.01
        this.bmi = (this.weight / (height * height)).toFixed(2)
    }

    bodyData.prototype.status = function () {
        let bmi = this.bmi;
        switch (true) {
            case (bmi < 18.5):
                this.status = '過輕';
                this.color = '#31BAF9'
                break;
            case (bmi < 24):
                this.status = '理想'
                this.color = '#86D73F'
                break;
            case (bmi < 27):
                this.status = '過重'
                this.color = '#FF982D'
                break;
            case (bmi < 30):
                this.status = '輕度肥胖'
                this.color = '#FF6C03'
                break;
            case (bmi < 35):
                this.status = '中度肥胖'
                this.color = '#FF6C03'
                break;
            case (bmi >= 35):
                this.status = '重度肥胖'
                this.color = '#FF1200'
                break;

            default:
                this.status = '理想';
                this.color = '#86D73F'
        }
    }


    let datas = JSON.parse(window.localStorage.getItem('datas')) || [];

    let saveDate = function () {
        window.localStorage.setItem('datas', JSON.stringify(datas))
    }

    return {
        getData() {
            return datas;
        },

        addNew(height, weight) {
            let newData, ID;
            ID = datas.length > 0 ? datas[datas.length - 1].id + 1 : 0;
            newData = new bodyData(ID, height, weight);
            newData.today();
            newData.calcBmi();
            newData.status();
            datas.push(newData)
            saveDate();
            return datas;
        },

        deleteItem(id) {
            datas = datas.filter(item => item.id != id);
            saveDate();

            return datas;
        },
    }

})();

//處理畫面
var UIController = (function () {
    let domStrings = {
        inputheight: '#add__height',
        inputweight: '#add__weight',
        inputBtn: '.form__btn',
        panelList: '.result-panel__title',
        panelItem: '.result-panel__item',
        resultPanel: '.result-panel',
        resultBtn: '.result__btn',
        resultBmi: '.result__bmi',
        resultReflash: '.result__reflash'
    }

    return {
        getInputs() {
            return {
                height: document.querySelector(domStrings.inputheight).value,
                weight: document.querySelector(domStrings.inputweight).value
            }
        },
        getDomStrings() {
            return domStrings;
        },

        upDateList(arr) {
            //渲染資料
            let newHtml = '';
            let title=`<h2 class = "result-panel__title"> BMI紀錄 </h2>`;

            arr.forEach(item => {
                newHtml = newHtml + `<div class="result-panel__item" style="border-left:7px solid ${item.color}" id=${item.id}><div>${item.status}</div><div><span>BMI</span>${item.bmi}</div><div><span>weight</span>${item.weight}</div><div><span>height</span>${item.height}</div><div><span>${item.date}</span></div><div style="width:50px"><button class="remove__btn"><i class="far fa-times-circle"></i></button></div></div>`
                return newHtml
            })
            document.querySelector(domStrings.panelList).innerHTML = title+newHtml;


            //渲染按鈕數據
            let thisArr = arr[arr.length - 1];
            let btnHtml = `<div class="result__bmi">${thisArr.bmi}<span>BMI</span></div><div class="result__reflash"><i class="fas fa-sync-alt"></i></div>`
            document.querySelector(domStrings.resultBtn).innerHTML = btnHtml;

            //渲染按鈕顏色
            document.querySelector(domStrings.resultBtn).style.cssText = `color:${thisArr.color};border: 6px solid ${thisArr.color};`
            document.querySelector(domStrings.resultReflash).style.backgroundColor = thisArr.color;
        },

        clearInputs() {
            //清除input欄
            let inputs, inputArr;
            inputs = document.querySelectorAll(`${domStrings.inputheight}, ${domStrings.inputweight}`)
            inputArr = Array.from(inputs).forEach(item => item.value = '');
        },

        showResultBtn() {
            
            document.querySelector(domStrings.resultBtn).classList.remove('d-none');
            document.querySelector(domStrings.inputBtn).classList.add('d-none');
        },

        showInputBtn() {
            document.querySelector(domStrings.inputBtn).classList.remove('d-none');
            document.querySelector(domStrings.resultBtn).classList.add('d-none');
        }
    }

}());

//接收資訊與指令
var controller = (function (dataCtrl, UICtrl) {

    //監聽事件
    let setEventListener = function () {
        //獲取classname
        let DomStrings = UICtrl.getDomStrings();
        document.querySelector(DomStrings.inputBtn).addEventListener('click', addNewBmi);
        document.querySelector(DomStrings.resultPanel).addEventListener('click', deletBmi);
        document.querySelector(DomStrings.resultBtn).addEventListener('click', update);
    }

    //新增BMI
    let addNewBmi = function (e) {
        e.preventDefault()
        let input, dataArray;

        // 1. 獲取input值
        input = UICtrl.getInputs()

        // 2. 產生新的物件並加入data中
        if (!isNaN(input.height) && !isNaN(input.weight) && input.height > 0 && input.weight > 0) {
            dataArray = dataCtrl.addNew(input.height, input.weight)
        }

        // 3. 更新資料畫面
        UICtrl.upDateList(dataArray)

        // 4.更新按鈕狀態、清除input
        UICtrl.showResultBtn()
        UICtrl.clearInputs()
    };

    //移除BMI
    let deletBmi = function (e) {

        // 1. 獲取id值
        let itemID, dataArray;
        e.preventDefault();
        itemID = e.target.parentNode.parentNode.parentNode.id

        // 2. 從data中刪除
        dataArray = dataCtrl.deleteItem(itemID)

        // 3. 更新畫面
        UICtrl.upDateList(dataArray)

        // 4.更新按鈕狀態、清除input
        UICtrl.showInputBtn()
        UICtrl.clearInputs()
    };

    //更新畫面
    let update = function () {
        // 1. 顯示InputBtn
        UICtrl.showInputBtn()

        // 2. 讀取資料
        let datas = dataCtrl.getData();
        UICtrl.upDateList(datas)
    }

    return {
        init: function () {
            // 1. 事件監聽
            setEventListener();
            // 2. 更新畫面
            update();

        }
    }

})(dataController, UIController)

controller.init();