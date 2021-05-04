var budgetController = (function(){

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)*100); 
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(totalIncome){
        return this.percentage;
    };

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, value){
            var newItem, ID;
            
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }

            if(type === 'exp'){
                newItem = new Expense(ID,des,value);
            }else{
                newItem = new Income(ID,des,value);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },
        calculateBudget: function(){
            //calculate total
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget income-expenses
            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0){
                data.percentage = Math.round(data.totals.exp / data.totals.inc) * 100;
            }else{
                data.percentage = -1;
            }

            // Expense = 100 and income 200, spent 50% = 100/200 = 0.5*100
        },
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        deleteItem: function(type, id){
            var ids,index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing:function(){
            console.log(data);
        }
    };
})();

var UIController = (function(){
    var DomStrings = {
        inputType: '.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    }
    var formatNumber = function(num,type){
            
            var numSplit, int, dec;

            num = Math.abs(num);
            num = num.toFixed(2);

            numSplit = num.split('.');
            int = numSplit[0];
            dec = numSplit[1];

            if(int.length > 3){
                int = int.substr(0,int.length-3) + "," + int.substr(int.length - 3,int.length);
            }
            var sign = type === 'exp'?'-':'+';

            return sign+' '+ int + '.'+dec;
    };

    return {
        getinput: function(){
            return {
                type:document.querySelector(DomStrings.inputType).value,
                description:document.querySelector(DomStrings.inputDescription).value,
                value:parseFloat(document.querySelector(DomStrings.inputValue).value)
            }
        },
        getDomStrings: function(){
            return DomStrings;
        },
        displayMonth: function(){
            var now = new Date();

            var year = now.getFullYear();

            var month = now.getMonth();

            var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' '+ year;
        },
        addListitem: function(obj,type){
            var html, newHtml,element;
            // Create HTML string with placeholder for
            if(type === 'inc'){
                element = DomStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else{
                element = DomStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //Replace the placeholder text with some actual data.allItems[type]

            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value));

            //Insert HTML into the DOM.
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields:function(){
            var fields,fieldsArray;
            
            fields = document.querySelectorAll(DomStrings.inputDescription + ', '+DomStrings.inputValue);
            
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current,index,array){
                current.value = "";
            });

            fieldsArray[0].focus();
        },
        displayBudget:function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DomStrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage+"%";
            }else{
                document.querySelector(DomStrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DomStrings.expensesPercLabel);
            
            var nodeListForEach = function(list,callback){
                for (var i = 0; i < list.length; i++) {
                    callback(list[i],i);
                }
            };
            nodeListForEach(fields,function(current,index){
                //Do stuff
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + "%";
                }else{
                    current.textContent = '---';
                }
            });
        }
    }
})();

var controller = (function(UICtrl,budgetCtrl){

    var setupEventListeners = function(){
        var DOM = UICtrl.getDomStrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    };

    var updateBudget = function(){
        //1. Calculate Budget
        budgetCtrl.calculateBudget();

        //2. return the budget
        var budget = budgetCtrl.getBudget();

        //3. display the budget on the UI
        UICtrl.displayBudget(budget);

        console.log(budget);
    };  

    var updatePercentage = function(){
        //1. calculate percentages
        budgetCtrl.calculatePercentages();
        //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        console.log(percentages);
        //3. 
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){
        var input,newItem;
        // 1. get the field input data
        input = UICtrl.getinput();

        if(input.description !=="" && !isNaN(input.value) && input.value > 0){
            // 2. add item to the budget list
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);
            // 3. add item to UI
            UICtrl.addListitem(newItem,input.type);
    
            // 4. clear the fields
            UICtrl.clearFields(); 
            // 4. calculate the budget 

            // 5. display the budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentage();
        }else{

        }
    };
    var ctrlDeleteItem = function(event){
        var itemId,splitID,type,ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId){
            splitID = itemId.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            //2. Delete the item from the user interface
            UICtrl.deleteListItem(itemId);
            //3.Update and show the new budget
            updateBudget();
        }
    };
    return {
        init: function(){
            console.log('Application has started.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            
            setupEventListeners();

            UICtrl.displayMonth();
        }
    }

})(UIController,budgetController);

controller.init();