import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import {
	OrganizationResult,
	PartialOrganizationResult,
	CommmitResult,
	PartialCommitResult
} from './data.model';

@Injectable({
	providedIn: 'root'
})
export class DataService {
	constructor(private http: HttpClient) {}

	/**
	 * Method to get the repos associated with an organization.
	 * @param organizationName The organization name we wish to search for. Defaulted to netflix.
	 */
	public getOrganizationRepos(
		organizationName: string = 'netflix'
	): Observable<OrganizationResult[]> {
		// Search seems to be case sensitive so we lowerCase the organization name.
		// i.e 'Google' returns 0 results but 'google' returns a full list.
		return this.http
			.get(
				`https://api.github.com/orgs/${organizationName.toLowerCase()}/repos`
			)
			.pipe(
				take(1),
				map((response: PartialOrganizationResult[]) => {
					this.storeResponse(response);
					return this.mapRepos(response);
				}),
				catchError((error: HttpErrorResponse) => {
					// This is ugly; we could create an enum with error status codes.
					// Alternatively there's a dependency with HttpErrorCodes but that seems overkill
					if (error.status === 403) {
						// We ran out of API calls
						return of(this.mapRepos(this.retrieveLocalStorage()));
					}

					return of([]);
				})
			);
	}

	/**
	 * Method to get the commits associated with a repon.
	 * @param organizationName The organization name we wish to search for. Defaulted to netflix.
	 * @param repoName Repository name we want to retrieve commits from.
	 */
	public getRepoCommits(
		organizationName: string = 'netflix',
		repoName: string
	): Observable<CommmitResult[]> {
		return this.http
			.get(
				`https://api.github.com/repos/${organizationName.toLowerCase()}/${repoName}/commits`
			)
			.pipe(
				take(1),
				map((response: PartialCommitResult[]) => {
					// Should probably store this into localStorage too
					return this.mapCommits(response);
				})
			);
	}

	/**
	 * Method used in mapping responseObject into OrganizationResult.
	 * @param responseObject
	 */
	private createOrganizationResponse(
		responseObject: PartialOrganizationResult
	) {
		return new OrganizationResult(responseObject);
	}

	/**
	 * Method used in mapping responseObject into OrganizationResult.
	 * @param responseObject
	 */
	private createCommitResponse(responseObject: PartialCommitResult) {
		return new CommmitResult(responseObject);
	}

	/**
	 * Method to map a repo array into an OrganizationResponse array
	 * @param object
	 */
	private mapRepos(object: PartialOrganizationResult[]): OrganizationResult[] {
		return object.map(organizationResult =>
			this.createOrganizationResponse(organizationResult)
		);
	}

	/**
	 * Method to map a commit array into an OrganizationResponse array
	 * @param object
	 */
	private mapCommits(object: PartialCommitResult[]): CommmitResult[] {
		return object.map(commitResult => this.createCommitResponse(commitResult));
	}

	/**
	 * Method to store the response in local storage
	 * @param response
	 */
	private storeResponse(response: PartialOrganizationResult[]): void {
		localStorage.setItem('githubAPIResponse', JSON.stringify(response));
	}

	/**
	 * Method to retrive data from localStorage
	 */
	private retrieveLocalStorage(): PartialOrganizationResult[] {
		return JSON.parse(localStorage.getItem('githubAPIResponse'));
	}
}
