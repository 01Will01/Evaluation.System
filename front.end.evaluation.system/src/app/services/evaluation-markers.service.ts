import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EvaluationMarkersService {

  constructor(private http: HttpClient) { }
  
  Change(id, limiteDate, period, statusCode, isChangePeriod): Observable<any> {
    var json = { "id": id, "limiteDate": limiteDate, "period": period, "statusCode": statusCode, "isChangePeriod": isChangePeriod };
    return this.http.put(`${environment.apiUrl}marcador/modificacao`, json);
  }

  Remove(id): Observable<any> {
    return this.http.request('DELETE', `${environment.apiUrl}area/${id}`);
  }

  Get(): Observable<any> {
    return this.http.get(`${environment.apiUrl}marcador`);
  }
}
