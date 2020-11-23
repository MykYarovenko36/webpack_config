import './styles/index.css';
import { of, fromEvent } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import {
    switchMap, catchError, filter, debounceTime, map,
} from 'rxjs/operators';

const inputField$ = fromEvent(document.querySelector('.search_input-field'), 'keyup');
const resultContainer = document.querySelector('.search_result-field');
const loader = document.querySelector('.loader');
const inputField = document.querySelector('.search_input-field');
inputField$.pipe(
    map((v) => {
        loader.hidden = false;
        return v.target.value;
    }),
    debounceTime(2000),
    filter((v) => fromFetch(`https://api.openweathermap.org/data/2.5/forecast?q=${v}&appid=bdda379c91faa9bf0e5eae4b5e97295e&lang=ru`).pipe(
        switchMap((response) => {
            if (response.ok) {
                return response.json();
            }
            return of({ error: true, message: `Error ${response.status}` });
        }),
        catchError((err) => {
            console.error(err);
            return of({ error: true, message: err.message });
        }),
    ).subscribe({
        next: (result) => {
            resultContainer.innerHTML = `
            <p>город: ${result.city.name}</p>
            <p>страна: ${result.city.country}</p>
            <p>id :${result.city.id}</p>
            <p>time-zone: UTC +${result.city.timezone / 3600}</p>
            <p>Население: ${result.city.population} человек</p>
            <p>температура: ${(result.list[0].main.temp - 273.15).toFixed(2)}°C</p>
            <p>${result.list[0].weather[0].description}</p>
            `;
        },
        complete: () => console.log('done'),
    })),
    map(() => {
        loader.hidden = true;
    }),
).subscribe(
    () => {
        inputField.value = '';
    },
);
