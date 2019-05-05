import { Injectable } from '@angular/core';


@Injectable()
export class DataService {

  baseUrl = 'http://localhost:8000/api';

  getAllCountries(specificIndex) {
    const url = `${this.baseUrl}/countries:${specificIndex}`;
    console.log(url);
     return fetch(url);
  }

  getAllIndexes(){
    const url = `${this.baseUrl}/indexes`;
    return fetch(url);
  }

  getIndexMeasureType(index){
    const url = `${this.baseUrl}/index_measure:${index}`;
    return fetch(url);
  }

  getAllDates(index,country){
    const url = `${this.baseUrl}/dates:${index}+${country}`;
    return fetch(url);
  }

  getAllValues(index,country,generic){
    const url = `${this.baseUrl}/values:${index}+${country}+${generic}`;
    return fetch(url);
  }

  getIndexType(index){
    const url = `${this.baseUrl}/index_type:${index}`;
    return fetch(url);
  }

  getIndexMeasure(index){
    const url = `${this.baseUrl}/measure:${index}`;
    return fetch(url);
  }
}

