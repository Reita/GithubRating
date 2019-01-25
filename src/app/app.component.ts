import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { catchError, debounceTime, take } from 'rxjs/operators';
import { OrganizationResult, CommmitResult } from './services/data.model';
import { DataService } from './services/data.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	public title = 'Github Org Search';
	public networkError: string;
	public organizationRepos: OrganizationResult[] = [];
	public repoCommits: CommmitResult[] = [];
	public organizationName = new FormControl('netflix');	// Defaulting to netflix
	public columnName = new FormControl('forks');			// Defaulting to sort by forks
	public currentSort: string;
	public selectedRepoName: string;
	public ascendingSortingOrder = true;

	constructor(private dataService: DataService, private renderer: Renderer2) {}

	ngOnInit() {
		this.updateRepos();

		this.organizationName.valueChanges
			.pipe(debounceTime(300)) // We don't want service calls every single key we type so we debounce
			.subscribe((value: string) => {
				this.updateRepos(value || 'Netflix');
			});

		this.columnName.valueChanges.subscribe((value: string) => {
			this.sortDataByKey(value);
		});
	}

	public getColumnNames(): string[] {
		// We only require one valid result in order to populate the column names that's why we
		// destructure using the first result.
		const [firstOrganizationResult] = this.organizationRepos;
		return Object.keys(firstOrganizationResult || []);
	}

	public sortHeader(key: string) {
		this.ascendingSortingOrder =
			this.currentSort === key ? !this.ascendingSortingOrder : true;

		this.sortDataByKey(key);
	}

	public getRepoCommits(repoName: string) {
		this.selectedRepoName = repoName;
		this.scrollLock();

		this.dataService
			.getRepoCommits(this.organizationName.value, repoName)
			.pipe(take(1))
			.subscribe(response => {
				this.repoCommits = response;
			});
	}

	public getMessageTitle(message: string): string {
		const splitMessage = message.split('\n');
		const [title] = splitMessage || [''];
		return title;
	}

	public dateParser(date: string): string {
		return new Date(date).toUTCString();
	}

	public dismissRepoCommmits() {
		this.repoCommits = [];
		this.scrollUnlock();
	}

	private updateRepos(organizationName?: string) {
		this.networkError = null;
		this.dataService
			.getOrganizationRepos(organizationName)
			.pipe(
				take(1),
				catchError(error => this.handleError(error))
			)
			.subscribe((response: OrganizationResult[]) => {
				this.organizationRepos = response;
				this.sortDataByKey(this.columnName.value);
			});
	}

	private handleError(error: string): Observable<string> {
		this.organizationRepos = [];
		this.networkError = error;
		return throwError(error);
	}

	/**
	 * Table sorter
	 * @param key Object key we will be sorting by
	 */
	private sortDataByKey(key: string): void {
		this.currentSort = key;

		if (key === 'name') {
			this.alphabeticSorter();
			return;
		}

		this.numericSorter(key);
	}

	/**
	 * Numeric sorter
	 * Depending on the current key it will alternate between descending/ascending sort
	 * @param key Object key we will be sorting by
	 */
	private numericSorter(key: string): void {
		this.organizationRepos = this.organizationRepos.sort((a, b) => {
			if (!this.ascendingSortingOrder) {
				return a[key] - b[key];
			} else {
				return b[key] - a[key];
			}
		});
	}

	/**
	 * Alphabetic sorter
	 */
	private alphabeticSorter(): void {
		this.organizationRepos = this.organizationRepos.sort((a, b) => {
			if (!this.ascendingSortingOrder) {
				return a.name.localeCompare(b.name);
			} else {
				return b.name.localeCompare(a.name);
			}

		});
	}

	private scrollLock(): void {
		const bodySelector = document.querySelector('body');
		this.renderer.addClass(bodySelector, 'nflix-scroll-block');
	}

	private scrollUnlock(): void {
		const bodySelector = document.querySelector('body');
		this.renderer.removeClass(bodySelector, 'nflix-scroll-block');
	}
}
