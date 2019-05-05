import {Component} from '@angular/core';
import {FormBuilder, FormControl} from '@angular/forms';
import {DataService} from '../shared/DataService';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {first} from 'rxjs/operators';



export interface ValueKeyPair{
  name:string,
  x:string,
  y:number,
  r:number;

}

export interface Multi {
  name: string,
  series: ValueKeyPair[];
}

@Component({
  selector: 'scatter',
  templateUrl: 'scatter.html',
})
export class ScatterComponent {

  //form controls control the input the user gave
  selectedUserIndexes = new FormControl();
  selectedGenericIndex = new FormControl();
  selectedValuesOfCountries = new FormControl();
  selectedValuesOfDates = new FormControl();
  selectedMinRange = new FormControl();
  selectedMaxRange = new FormControl();

  //list of all the available countries
  countries = [];

  //l1 is like a helper list that stores the measure types of each index and to which index they correspond
  l1 = [];

  //list of all the available indexes
  indexes = [];

  //first groupped list contains every index and how is measured e.g. [{electricity, per person},{oil consumption, 1000 tonnes}]
  firstGrouppedList = [];

  //all the available years
  years = [];

  //selectedIndexes are the indexes the user chose
  selectedIndexes = [];

  //all metrics that are available but with duplicates inside
  metrics: string[] = [];

  //all metrics that are available
  filteredMetrics: string[];

  //according to the range the user selected this will have the appropriate groupping options
  groupByYears = [];

  //the countries the user chose
  selectedCountries = [];

  //variable for the linear stepper
  isLinear = true;

  //variable to display the available dates
  availableDatesString: string;

  //generic the user selected

  genericIndexUserSelected: string;

  //min and max are computed from the years list
  minAvailable: number;
  maxAvailable: number;

  //min and max user selected are the range the user chose
  minUserSelected: number;
  maxUserSelected: number;

  //initial value for the progress bar
  progressBarValue = 1;

  //false and true to display and hide the dotted progress line
  progress = false;

  //this is the value of grouping that the user chose
  groupByValue;

  //variables to lock each step if its not completed
  step0 = false;
  step1 = false;
  //this was added later to modify the process because i need an extra step for this graph
  step12 = false;
  step2 = false;
  step3 = false;
  step4 = false;

  //final data for the graph
  finalData: Multi[] = [];

  //list that holds the generic indexes
  genericList = [];

  //list that holds the specific indexes
  specificList = [];

  //flag to know when the user has completed the data visualisation options
  createGraphFlag = false;


  // Graph options
  view: any[] = [1300, 700];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Year';
  showYAxisLabel = true;
  timeline = true;
  colorScheme = {
    domain: ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080',
      '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080',]
  };
  yAxisLabel: string;


  constructor(private _formBuilder: FormBuilder, private _dataService: DataService, private _snackBar: MatSnackBar,private _router : Router) {}

  async getIndexes(stepper) {
    this.step0 = true;
    this.progress = true;
    await this._dataService.getAllIndexes().then(response => response.json())
      .then(data => {
        let indexObject = data;
        this.indexes = [];
        Object.entries(indexObject).forEach(entry => {
          Object.entries(entry[1]).forEach(entry => {
            let value = entry[1];
            let splitted = JSON.stringify(value).split('"');
            this.indexes.push(splitted[3]);
          });
        });
        //filter out of the array unwanted columns
        this.indexes = this.indexes.filter(item => item !== 'country');
        this.indexes = this.indexes.filter(item => item !== 'year');
        this.indexes = this.indexes.filter(item => item !== 'id');
      })
      .catch(error => console.error(error));
    for (let item of this.indexes) {
      await this._dataService.getIndexMeasureType(item).then(response1 => response1.json())
        .then(data1 => {
          let splittedType = JSON.stringify(data1).split('"');
          this.metrics.push(splittedType[5]);
          this.firstGrouppedList.push([item, splittedType[5]]);
          this.progressBarValue = 20;
        }).catch(error => console.error(error));
    }
    this.filteredMetrics = this.metrics.filter((el, i, a) => i === a.indexOf(el))
    for (let i = 0; i < this.filteredMetrics.length; i++) {
      let l2: string[] = [];
      let found_flag = 0;
      for (let item in this.firstGrouppedList) {
        if (this.filteredMetrics[i] == this.firstGrouppedList[item][1]) {
          l2.push(this.firstGrouppedList[item][0]);
          found_flag = 1;
        }
      }
      if (found_flag == 1) {
        this.l1.push(l2);
      }
    }
    // console.log(this.l1);
    // console.log(this.filteredMetrics);
    // console.log(this.firstGrouppedList);
    for(let metr of this.firstGrouppedList){
      await this._dataService.getIndexType(metr[0]).then(response => response.json())
        .then( data => {
          let splitted = JSON.stringify(data).split('"');
          if(splitted[5]=='generic'){
            this.genericList.push(metr[0]);
          }else{
            this.specificList.push(metr[0]);
          }
        }).catch(error => console.error(error));
    }
    this.progress = false;
    stepper.next();
  }

  /*check if all the indexes the user chose are from the same category and proceed to the next step*/
  async specificValueFromFormUpdated(stepper) {
    this.step1 = true;
    this.progress = true;
    let arrayFlag = [];
    this.selectedIndexes = this.selectedUserIndexes.value;
    for (let i in this.selectedUserIndexes.value) {
      for (let j in this.firstGrouppedList) {
        if (this.selectedUserIndexes.value[i] == (this.firstGrouppedList[j])[0]) {
          arrayFlag.push((this.firstGrouppedList[j])[1]);
        }
      }
    }
    if (arrayFlag.length > 0) {
      for (let item in this.selectedUserIndexes.value) {
        await this._dataService.getAllCountries(this.selectedUserIndexes.value[item]).then(response => response.json())
          .then(data => {
            let countryObject = data;
            Object.entries(countryObject).forEach(entry => {
              Object.entries(entry[1]).forEach(entry => {
                let value = entry[1];
                let splitted = JSON.stringify(value).split('"');
                if (!(splitted[3] in this.countries)) {
                  this.countries.push(splitted[3]);
                }
              });
            });
            this.countries.splice(this.countries.indexOf('type'), 1);
            this.countries.splice(this.countries.indexOf('measure'), 1);
            this.progressBarValue = 45;
          })
          .catch(error => console.error(error));
      }
      this.progress = false;
      stepper.next();
      //filter out the measure and type from the list
    } else {
      this._snackBar.open("Please select one ore more indexes", "Dismiss", {
        duration: 3000,
      });
      this.step1 = false;
      this.progress = false;
    }
  }

  async genericValueFromFormUpdated(stepper) {
    this.step12 = true;
    this.progress = true;
    if (this.selectedGenericIndex.value == undefined || this.selectedGenericIndex.value == null) {
      this._snackBar.open("please select one generic index", "Dismiss", {
        duration: 3000,
      });
      this.step12 = false;
      this.progress = false;
    }else {
      this.genericIndexUserSelected = this.selectedGenericIndex.value;
    }
    this.progress = false;
    await this._dataService.getAllIndexes().then(response => response.json())
      .then(data => {
      }).catch();
    stepper.next();
  }


  async countriesSelected(stepper) {
    this.progress = true;
    this.step2 = true;
    if (this.selectedValuesOfCountries.value.length < 1 || this.selectedValuesOfCountries.value == undefined || this.selectedValuesOfCountries.value == null) {
      this._snackBar.open("Please select one or more countries", "Dismiss", {
        duration: 3000,
      });
      this.step2 = false;
      this.progress = false;
    } else {
      this.selectedCountries = this.selectedValuesOfCountries.value;
      for (let i in this.selectedIndexes) {
        for (let item in this.selectedValuesOfCountries.value) {
          await this._dataService.getAllDates(this.selectedIndexes[i], this.selectedValuesOfCountries.value[item]).then(response => response.json())
            .then(data => {
              let dateObject = data;
              Object.entries(dateObject).forEach(entry => {
                Object.entries(entry[1]).forEach(entry => {
                  let value = entry[1];
                  let splitted = JSON.stringify(value).split('"');
                  if (!(splitted[3] in this.years)) {
                    this.years.push(splitted[3]);
                  }
                });
              });
              this.progressBarValue = 60;
            })
            .catch(error => console.error(error));
        }
      }
      this.maxAvailable = Math.max.apply(null, this.years);
      this.minAvailable = Math.min.apply(null, this.years);
      this.availableDatesString = `Available Dates are between ${this.minAvailable} and ${this.maxAvailable}`;
      this.progress = false;
      stepper.next();
    }
  }

  async rangeSelected(stepper) {
    this.progress = true;
    if (!(this.selectedMinRange.value > 0)) {
      this._snackBar.open(" 'From' date field cannot be empty and must be a number", "Dismiss", {
        duration: 3000,
      });
      this.progress = false;
      return;
    }
    if (!(this.selectedMaxRange.value > 0)) {
      this._snackBar.open(" 'To' date field cannot be empty must be a number", "Dismiss", {
        duration: 3000,
      });
      this.progress = false;
      return;
    }
    if (this.selectedMinRange.value < this.minAvailable || this.selectedMinRange.value > this.maxAvailable) {
      this._snackBar.open(" 'From' value must be inside the range displayed above", "Dismiss", {
        duration: 3000,
      });
      this.progress = false;
      return;
    }
    if (this.selectedMaxRange.value > this.maxAvailable || this.selectedMaxRange.value < this.minAvailable) {
      this._snackBar.open(" 'To' value must be inside the range displayed above", "Dismiss", {
        duration: 3000,
      });
      this.progress = false;
      return;
    }

    this.minUserSelected = this.selectedMinRange.value;
    this.maxUserSelected = this.selectedMaxRange.value;
    let diff = this.selectedMaxRange.value - this.selectedMinRange.value;

    //first case has the <10 so it wont be always true

    if (diff >= 1 && diff < 10) {
      this.groupByYears = ['All years will be displayed'];
    } else if (diff >= 10 && diff < 20) {
      this.groupByYears = ['All years will be displayed', 'Group by 5 years'];
    } else if (diff >= 20) {
      this.groupByYears = ['All years will be displayed', 'Group by 5 years', 'Group by 10 years'];
    } else {
      this._snackBar.open("Please try again with a correct interval", "Dismiss", {
        duration: 3000,
      });
      this.progress = false;
      return;
    }
    this.progress = false;
    this.progressBarValue = 70;
    this.step3 = true;
    /*this call dont do anything, there is a bug with the [completed] binding value
    of the steps and i found out that if i do a async call between this.step4 = true; and
    stepper.next();  they work i really dont know why.
    */
    await this._dataService.getAllIndexes().then(response => response.json())
      .then(data => {
      }).catch();
    stepper.next();
  }


  async datesSelected(stepper) {
    this.progress = true;
    if (this.selectedValuesOfDates.value === null) {
      this._snackBar.open("Please select one option for grouping", "Dismiss", {
        duration: 3000,
      });
      this.progress = false;
      return;
    }else if (this.selectedValuesOfDates.value == this.groupByYears[0]) {
      this.groupByValue = 1;
    } else if (this.selectedValuesOfDates.value == this.groupByYears[1]) {
      this.groupByValue = 5;
    } else if (this.selectedValuesOfDates.value == this.groupByYears[2]) {
      this.groupByValue = 10;
    }
    this.progressBarValue = 90;
    this.progress = false;
    this.step4 = true;
    /*this call dont do anything, there is a bug with the [completed] binding value
      of the steps and i found out that if i do a async call between this.step4 = true; and
      stepper.next();  they work i really dont know why.
     */
    await this._dataService.getAllIndexes().then(response => response.json())
      .then(data => {
      }).catch();
    stepper.next();
  }


  async fetchFinalData() {
    this.progress = true;
    this.progressBarValue = 100;

    for (let i in this.selectedIndexes) {
      for (let j in this.selectedCountries) {
        //gradually create the Multi interface with data
        //series have data for every year of a country
        await this._dataService.getAllValues(this.selectedIndexes[i], this.selectedCountries[j],this.genericIndexUserSelected).then(response => response.json()).then(data => {
          let valueObject = data;
          let insideArrays: Multi;
          let tempValues: ValueKeyPair[] = [];
          //console.log(JSON.stringify(data));
          Object.entries(valueObject).forEach(entry => {
            let averageCounter = 0;
            let valueToBeAdded = 0;
            let genericValueToBeAdded = 0;
            Object.entries(entry[1]).forEach(entry => {
              let value = entry[1];
              let splitted = JSON.stringify(value).split('"');

              //splitted[1] is the name of the index
              //splitted[3] is the specific index value
              //splitted[7] is the year of the specific index value
              //splitted[11] is the generic index value

              //this code is to prepare the data for the ngx library
              if (!(parseInt(splitted[7]) > this.minUserSelected-this.groupByValue && parseInt(splitted[7]) <= this.maxUserSelected)){
                //do nothing, user not interested in this year
              }else{
                console.log(averageCounter+" eksw");
                if(splitted[3]=="nan") {
                  averageCounter = averageCounter+1;
                }else{
                  valueToBeAdded = valueToBeAdded + parseFloat(splitted[3]);
                  averageCounter = averageCounter+1;
                }
                if(splitted[11]=="nan") {
                  //dont sum the value its empty
                }else{
                  console.log(splitted[11]);
                  genericValueToBeAdded = genericValueToBeAdded + parseFloat(splitted[11]);
                }


                //checks if the data is within the user selected years
                if (averageCounter == this.groupByValue){
                  //console.log("counter:"+averageCounter+"val:"+this.groupByValue+"name"+splitted[7]);
                  let tempData: ValueKeyPair = ({name: splitted[7], x:splitted[7],y: valueToBeAdded/this.groupByValue,r:genericValueToBeAdded/this.groupByValue});
                  tempValues.push(tempData);
                  averageCounter = 0;
                  valueToBeAdded = 0;
                  genericValueToBeAdded = 0;
                }
              }
            });
          });
          insideArrays = ({name: this.selectedCountries[j]+" "+this.selectedIndexes[i], series: tempValues});
          this.finalData.push(insideArrays);
        }).catch();
      }
    }

    this.createGraphFlag = true;

    // console.log(this.l1);
    // console.log(this.filteredMetrics);
    // console.log(this.indexes);
    //console.log(this.finalData);
  }


  reset(stepper,flag) {
    this.countries = [];
    this.l1 = [];
    this.indexes = [];
    this.firstGrouppedList = [];
    this.years = [];
    this.selectedIndexes = [];
    this.metrics = [];
    this.filteredMetrics = [];
    this.groupByYears = [];
    this.selectedCountries = [];
    this.genericList = [];
    this.specificList = [];
    this.availableDatesString = undefined;
    this.minAvailable = undefined;
    this.maxAvailable = undefined;
    this.minUserSelected = undefined;
    this.maxUserSelected = undefined;
    this.genericIndexUserSelected = undefined;
    this.progressBarValue = 1;
    this.progress = false;
    this.groupByValue = undefined;
    this.groupByValue = false;
    this.step0 = false;
    this.step1 = false;
    this.step2 = false;
    this.step3 = false;
    this.step4 = false;
    this.finalData = [];
    this.createGraphFlag = false;
    this.selectedValuesOfCountries = new FormControl();
    this.selectedUserIndexes = new FormControl();
    this.selectedGenericIndex = new FormControl();
    this.selectedValuesOfDates = new FormControl();
    this.selectedMinRange = new FormControl();
    this.selectedMaxRange = new FormControl();
    if (flag == 1) {
      stepper.reset()
    }
  }
}




