import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  // public baseUrl = "http://localhost:8080";
  public baseUrl = 'https://odc-api.onrender.com';

  constructor(private http: HttpClient) {}


  /**
   * Récupère des données à partir d'un point de terminaison spécifié.
   *
   * @param {string} name - Le nom du point de l'endpoint.
   * @return {Observable<any>} Un observable qui émet les données récupérées.
   */
  get(name: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${name}`);
  }

  getId(name: string, id:number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${name}/${id}`);
  }

  getById(name: string, id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${name}/${id}`);
  }

  /**
   * Envoie une requête POST à l'endpoint spécifié pour créer une nouvelle ressource.
   *
   * @param {string} name - Le nom de l'endpoint.
   * @param {Object} object - Les données à envoyer dans le corps de la requête.
   * @return {Observable<Object>} Un observable qui émet la réponse du serveur.
   */
  post(name: string, object: Object): Observable<Object> {
    return this.http.post(`${this.baseUrl}/${name}`, object).pipe(
      catchError(this.handleError) // Ajout de la gestion des erreurs
    );
  }


  /**
   * Met à jour un objet dans la collection spécifiée.
   *
   * @param {string} name - Le nom de l'endpoint.
   * @param {number} id - L'ID de l'objet à mettre à jour.
   * @param {Object} object - L'objet mis à jour.
   * @return {Observable<Object>} Un observable qui émet l'objet mis à jour.
   */
  update(name: string,id: number, object: Object): Observable<Object> {
    return this.http.patch(`${this.baseUrl}/${name}/${id}`, object).pipe(
      catchError(this.handleError) // Ajout de la gestion des erreurs
    );
  }

  /**
   * Supprime un objet d'une collection spécifiée.
   *
   * @param {string} name - Le nom de l'endpoint .
   * @param {number} id - L'ID de l'objet à supprimer.
   * @return {Observable<any>} Un observable qui émet la réponse du serveur.
   */
  delete(name: string,id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${name}/${id}`).pipe(
      catchError(this.handleError) // Ajout de la gestion des erreurs
    );
  }

  uploadParticipants(id: number, file: File, toListeDebut: boolean) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('toListeDebut', toListeDebut.toString());

    const url = `https://odcactivituy.onrender.com/etape/${id}/participants/upload`;
    console.log('Appel API à l\'URL :', url);  // Vérifiez l'URL

    return this.http.post(url, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Gestion des erreurs
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue est survenue';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Erreur côté serveur, on n'affiche que le message d'erreur sans le code HTTP
      errorMessage = error.error.message || error.message || 'Une erreur inconnue est survenue';
    }
    return throwError(() => new Error(errorMessage));
  }
}
