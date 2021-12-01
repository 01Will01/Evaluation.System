import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColaboratorService {

  constructor(private http: HttpClient) { }

  Input(userId, name, email, password, idEvaluator, areaId, responsibilityId): Observable<any> {
    var json = { "userId": userId, "name": name, "email": email, "password": password, "evaluatorId": idEvaluator, "responsibilityId": responsibilityId, "areaId": areaId};
    return this.http.post(`${environment.apiUrl}usuarios/cadastrar`, json);
  } 

  Change(userId, id, name, email, password, idEvaluator, areaId, responsibilityId, isChangePassword): Observable<any> {
    var json = { "userId": userId, "id": id, "name": name, "email": email, "password": password, "evaluatorId": idEvaluator, "areaId": areaId, "responsibilityId": responsibilityId,"isChangePassword":isChangePassword };
    return this.http.put(`${environment.apiUrl}usuarios`, json);
  }

  Remove(id, userId): Observable<any> {
    return this.http.request('DELETE', `${environment.apiUrl}usuarios/${id}`);
  }

  Get(): Observable<any> {
    return this.http.get(`${environment.apiUrl}usuarios`);
  }

  GetEvaluator(): Observable<any> {
    return this.http.get(`${environment.apiUrl}avaliadores`);
  }
}