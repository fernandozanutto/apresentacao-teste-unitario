import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { CdkTableModule } from '@angular/cdk/table';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  async,
  ComponentFixture,
  inject,
  TestBed
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AplsTableModule } from '../table';
import {
  AplsSort,
  AplsSortHeader,
  AplsSortHeaderIntl,
  AplsSortModule,
  Sort,
  SortDirection
} from '.';
import {
  getSortDuplicateSortableIdError,
  getSortHeaderMissingIdError,
  getSortHeaderNotContainedWithinSortError,
  getSortInvalidDirectionError
} from './sort-errors';

describe('AplsSort', () => {
  let fixture: ComponentFixture<SimpleAplsSortApp>;

  let component: SimpleAplsSortApp;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [
          AplsSortModule,
          AplsTableModule,
          CdkTableModule,
          NoopAnimationsModule
        ],
        declarations: [
          SimpleAplsSortApp,
          CdkTableAplsSortApp,
          AplsTableAplsSortApp,
          AplsSortHeaderMissingAplsSortApp,
          AplsSortDuplicateAplsSortableIdsApp,
          AplsSortableMissingIdApp,
          AplsSortableInvalidDirection
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleAplsSortApp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have the sort headers register and deregister themselves', () => {
    const sortables = component.aplsSort.sortables;
    expect(sortables.size).toBe(4);
    expect(sortables.get('defaultA')).toBe(component.defaultA);
    expect(sortables.get('defaultB')).toBe(component.defaultB);

    fixture.destroy();
    expect(sortables.size).toBe(0);
  });

  it('should use the column definition if used within a cdk table', () => {
    let cdkTableAplsSortAppFixture = TestBed.createComponent(
      CdkTableAplsSortApp
    );
    let cdkTableAplsSortAppComponent =
      cdkTableAplsSortAppFixture.componentInstance;

    cdkTableAplsSortAppFixture.detectChanges();
    cdkTableAplsSortAppFixture.detectChanges();

    const sortables = cdkTableAplsSortAppComponent.aplsSort.sortables;
    expect(sortables.size).toBe(3);
    expect(sortables.has('column_a')).toBe(true);
    expect(sortables.has('column_b')).toBe(true);
    expect(sortables.has('column_c')).toBe(true);
  });

  it('should use the column definition if used within an apls table', () => {
    let aplsTableAplsSortAppFixture = TestBed.createComponent(
      AplsTableAplsSortApp
    );
    let aplsTableAplsSortAppComponent =
      aplsTableAplsSortAppFixture.componentInstance;

    aplsTableAplsSortAppFixture.detectChanges();
    aplsTableAplsSortAppFixture.detectChanges();

    const sortables = aplsTableAplsSortAppComponent.aplsSort.sortables;
    expect(sortables.size).toBe(3);
    expect(sortables.has('column_a')).toBe(true);
    expect(sortables.has('column_b')).toBe(true);
    expect(sortables.has('column_c')).toBe(true);
  });

  describe('checking correct arrow direction and view state for its various states', () => {
    let expectedStates: Map<
      string,
      { viewState: string; arrowDirection: string }
    >;

    beforeEach(() => {
      // Starting state for the view and directions - note that overrideStart is reversed to be desc
      expectedStates = new Map<
        string,
        { viewState: string; arrowDirection: string }
      >([
        ['defaultA', { viewState: 'asc', arrowDirection: 'asc' }],
        ['defaultB', { viewState: 'asc', arrowDirection: 'asc' }],
        ['overrideStart', { viewState: 'desc', arrowDirection: 'desc' }],
        ['overrideDisableClear', { viewState: 'asc', arrowDirection: 'asc' }]
      ]);
      component.expectViewAndDirectionStates(expectedStates);
    });

    it('should be correct when mousing over headers and leaving on mouseleave', () => {
      // Mousing over the first sort should set the view state to hint (asc)
      component.dispatchMouseEvent('defaultA', 'mouseenter');
      expectedStates.set('defaultA', {
        viewState: 'asc-to-hint',
        arrowDirection: 'asc'
      });
      component.expectViewAndDirectionStates(expectedStates);

      // Mousing away from the first sort should hide the arrow
      component.dispatchMouseEvent('defaultA', 'mouseleave');
      expectedStates.set('defaultA', {
        viewState: 'hint-to-asc',
        arrowDirection: 'asc'
      });
      component.expectViewAndDirectionStates(expectedStates);

      // Mousing over another sort should set the view state to hint (desc)
      component.dispatchMouseEvent('overrideStart', 'mouseenter');
      expectedStates.set('overrideStart', {
        viewState: 'desc-to-hint',
        arrowDirection: 'desc'
      });
      component.expectViewAndDirectionStates(expectedStates);
    });

    it('should be correct when mousing over header and then sorting', () => {
      // Mousing over the first sort should set the view state to hint
      component.dispatchMouseEvent('defaultA', 'mouseenter');
      expectedStates.set('defaultA', {
        viewState: 'asc-to-hint',
        arrowDirection: 'asc'
      });
      component.expectViewAndDirectionStates(expectedStates);

      // Clicking sort on the header should set it to be active immediately
      // (since it was already hinted)
      component.dispatchMouseEvent('defaultA', 'click');
      expectedStates.set('defaultA', {
        viewState: 'active',
        arrowDirection: 'active-asc'
      });
      component.expectViewAndDirectionStates(expectedStates);
    });

    it('should be correct when cycling through a default sort header', () => {
      // Sort the header to set it to the active start state
      component.sort('defaultA');
      expectedStates.set('defaultA', {
        viewState: 'asc-to-active',
        arrowDirection: 'active-asc'
      });
      component.expectViewAndDirectionStates(expectedStates);

      // Sorting again will reverse its direction
      component.dispatchMouseEvent('defaultA', 'click');
      expectedStates.set('defaultA', {
        viewState: 'active',
        arrowDirection: 'active-desc'
      });
      component.expectViewAndDirectionStates(expectedStates);

      // Sorting again will remove the sort and animate away the view
      component.dispatchMouseEvent('defaultA', 'click');
      expectedStates.set('defaultA', {
        viewState: 'active-to-desc',
        arrowDirection: 'desc'
      });
      component.expectViewAndDirectionStates(expectedStates);
    });

    it('should not enter sort with animations if an animations is disabled', () => {
      // Sort the header to set it to the active start state
      component.defaultA._disableViewStateAnimation = true;
      component.sort('defaultA');
      expectedStates.set('defaultA', {
        viewState: 'active',
        arrowDirection: 'active-asc'
      });
      component.expectViewAndDirectionStates(expectedStates);

      // Sorting again will reverse its direction
      component.defaultA._disableViewStateAnimation = true;
      component.dispatchMouseEvent('defaultA', 'click');
      expectedStates.set('defaultA', {
        viewState: 'active',
        arrowDirection: 'active-desc'
      });
      component.expectViewAndDirectionStates(expectedStates);
    });

    it('should be correct when sort has changed while a header is active', () => {
      // Sort the first header to set up
      component.sort('defaultA');
      expectedStates.set('defaultA', {
        viewState: 'asc-to-active',
        arrowDirection: 'active-asc'
      });
      component.expectViewAndDirectionStates(expectedStates);

      // Sort the second header and verify that the first header animated away
      component.dispatchMouseEvent('defaultB', 'click');
      expectedStates.set('defaultA', {
        viewState: 'active-to-asc',
        arrowDirection: 'asc'
      });
      expectedStates.set('defaultB', {
        viewState: 'asc-to-active',
        arrowDirection: 'active-asc'
      });
      component.expectViewAndDirectionStates(expectedStates);
    });

    it('should be correct when sort has been disabled', () => {
      // Mousing over the first sort should set the view state to hint
      component.disabledColumnSort = true;
      fixture.detectChanges();

      component.dispatchMouseEvent('defaultA', 'mouseenter');
      component.expectViewAndDirectionStates(expectedStates);
    });
  });

  it('should be able to cycle from asc -> desc from either start point', () => {
    component.disableClear = true;

    component.start = 'asc';
    testSingleColumnSortDirectionSequence(fixture, ['asc', 'desc']);

    // Reverse directions
    component.start = 'desc';
    testSingleColumnSortDirectionSequence(fixture, ['desc', 'asc']);
  });

  it('should be able to cycle asc -> desc -> [none]', () => {
    component.start = 'asc';
    testSingleColumnSortDirectionSequence(fixture, ['asc', 'desc', '']);
  });

  it('should be able to cycle desc -> asc -> [none]', () => {
    component.start = 'desc';
    testSingleColumnSortDirectionSequence(fixture, ['desc', 'asc', '']);
  });

  it('should allow for the cycling the sort direction to be disabled per column', () => {
    const button = fixture.nativeElement.querySelector('#defaultA button');

    component.sort('defaultA');
    expect(component.aplsSort.direction).toBe('asc');
    expect(button.getAttribute('disabled')).toBeFalsy();

    component.disabledColumnSort = true;
    fixture.detectChanges();

    component.sort('defaultA');
    expect(component.aplsSort.direction).toBe('asc');
    expect(button.getAttribute('disabled')).toBe('true');
  });

  it('should allow for the cycling the sort direction to be disabled for all columns', () => {
    const button = fixture.nativeElement.querySelector('#defaultA button');

    component.sort('defaultA');
    expect(component.aplsSort.active).toBe('defaultA');
    expect(component.aplsSort.direction).toBe('asc');
    expect(button.getAttribute('disabled')).toBeFalsy();

    component.disableAllSort = true;
    fixture.detectChanges();

    component.sort('defaultA');
    expect(component.aplsSort.active).toBe('defaultA');
    expect(component.aplsSort.direction).toBe('asc');
    expect(button.getAttribute('disabled')).toBe('true');

    component.sort('defaultB');
    expect(component.aplsSort.active).toBe('defaultA');
    expect(component.aplsSort.direction).toBe('asc');
    expect(button.getAttribute('disabled')).toBe('true');
  });

  it('should reset sort direction when a different column is sorted', () => {
    component.sort('defaultA');
    expect(component.aplsSort.active).toBe('defaultA');
    expect(component.aplsSort.direction).toBe('asc');

    component.sort('defaultA');
    expect(component.aplsSort.active).toBe('defaultA');
    expect(component.aplsSort.direction).toBe('desc');

    component.sort('defaultB');
    expect(component.aplsSort.active).toBe('defaultB');
    expect(component.aplsSort.direction).toBe('asc');
  });

  it('should allow let AplsSortable override the default sort parameters', () => {
    testSingleColumnSortDirectionSequence(fixture, ['asc', 'desc', '']);

    testSingleColumnSortDirectionSequence(
      fixture,
      ['desc', 'asc', ''],
      'overrideStart'
    );

    testSingleColumnSortDirectionSequence(
      fixture,
      ['asc', 'desc'],
      'overrideDisableClear'
    );
  });

  it('should apply the aria-labels to the button', () => {
    const button = fixture.nativeElement.querySelector('#defaultA button');
    expect(button.getAttribute('aria-label')).toBe(
      'Change sorting for defaultA'
    );
  });

  it('should apply the aria-sort label to the header when sorted', () => {
    const sortHeaderElement = fixture.nativeElement.querySelector('#defaultA');
    expect(sortHeaderElement.getAttribute('aria-sort')).toBe(null);

    component.sort('defaultA');
    fixture.detectChanges();
    expect(sortHeaderElement.getAttribute('aria-sort')).toBe('ascending');

    component.sort('defaultA');
    fixture.detectChanges();
    expect(sortHeaderElement.getAttribute('aria-sort')).toBe('descending');

    component.sort('defaultA');
    fixture.detectChanges();
    expect(sortHeaderElement.getAttribute('aria-sort')).toBe(null);
  });

  it(
    'should re-render when the i18n labels have changed',
    inject([AplsSortHeaderIntl], (intl: AplsSortHeaderIntl) => {
      const header = fixture.debugElement.query(By.directive(AplsSortHeader))
        .nativeElement;
      const button = header.querySelector('.apls-sort-header-button');

      intl.sortButtonLabel = () => 'Sort all of the things';
      intl.changes.next();
      fixture.detectChanges();

      expect(button.getAttribute('aria-label')).toBe('Sort all of the things');
    })
  );
});

/**
 * Performs a sequence of sorting on a single column to see if the sort directions are
 * consistent with expectations. Detects any changes in the fixture to reflect any changes in
 * the inputs and resets the AplsSort to remove any side effects from previous tests.
 */
function testSingleColumnSortDirectionSequence(
  fixture: ComponentFixture<SimpleAplsSortApp>,
  expectedSequence: SortDirection[],
  id: SimpleAplsSortAppColumnIds = 'defaultA'
) {
  // Detect any changes that were made in preparation for this sort sequence
  fixture.detectChanges();

  // Reset the sort to make sure there are no side affects from previous tests
  const component = fixture.componentInstance;
  component.aplsSort.active = '';
  component.aplsSort.direction = '';

  // Run through the sequence to confirm the order
  let actualSequence = expectedSequence.map(() => {
    component.sort(id);

    // Check that the sort event's active sort is consistent with the AplsSort
    expect(component.aplsSort.active).toBe(id);
    expect(component.latestSortEvent.active).toBe(id);

    // Check that the sort event's direction is consistent with the AplsSort
    expect(component.aplsSort.direction).toBe(
      component.latestSortEvent.direction
    );
    return component.aplsSort.direction;
  });
  expect(actualSequence).toEqual(expectedSequence);

  // Expect that performing one more sort will loop it back to the beginning.
  component.sort(id);
  expect(component.aplsSort.direction).toBe(expectedSequence[0]);
}

/** Column IDs of the SimpleAplsSortApp for typing of function params in the component (e.g. sort) */
type SimpleAplsSortAppColumnIds =
  | 'defaultA'
  | 'defaultB'
  | 'overrideStart'
  | 'overrideDisableClear';

@Component({
  template: `
    <div aplsSort
         [aplsSortActive]="active"
         [aplsSortDisabled]="disableAllSort"
         [aplsSortStart]="start"
         [aplsSortDirection]="direction"
         [aplsSortDisableClear]="disableClear"
         (aplsSortChange)="latestSortEvent = $event">
      <div id="defaultA"
           #defaultA
           apls-sort-header="defaultA"
           [disabled]="disabledColumnSort">
        A
      </div>
      <div id="defaultB"
           #defaultB
           apls-sort-header="defaultB">
        B
      </div>
      <div id="overrideStart"
           #overrideStart
           apls-sort-header="overrideStart" start="desc">
        D
      </div>
      <div id="overrideDisableClear"
           #overrideDisableClear
           apls-sort-header="overrideDisableClear"
           disableClear>
        E
      </div>
    </div>
  `
})
class SimpleAplsSortApp {
  latestSortEvent: Sort;

  active: string;
  start: SortDirection = 'asc';
  direction: SortDirection = '';
  disableClear: boolean;
  disabledColumnSort = false;
  disableAllSort = false;

  @ViewChild(AplsSort) aplsSort: AplsSort;
  @ViewChild('defaultA') defaultA: AplsSortHeader;
  @ViewChild('defaultB') defaultB: AplsSortHeader;
  @ViewChild('overrideStart') overrideStart: AplsSortHeader;
  @ViewChild('overrideDisableClear') overrideDisableClear: AplsSortHeader;

  constructor(public elementRef: ElementRef) {}

  sort(id: SimpleAplsSortAppColumnIds) {
    this.dispatchMouseEvent(id, 'click');
  }

  dispatchMouseEvent(id: SimpleAplsSortAppColumnIds, event: string) {
    const sortElement = this.elementRef.nativeElement.querySelector(`#${id}`);
  }

  /**
   * Checks expectations for each sort header's view state and arrow direction states. Receives a
   * map that is keyed by each sort header's ID and contains the expectation for that header's
   * states.
   */
  expectViewAndDirectionStates(
    viewStates: Map<string, { viewState: string; arrowDirection: string }>
  ) {
    const sortHeaders = new Map([
      ['defaultA', this.defaultA],
      ['defaultB', this.defaultB],
      ['overrideStart', this.overrideStart],
      ['overrideDisableClear', this.overrideDisableClear]
    ]);

    viewStates.forEach((viewState, id) => {
      expect(sortHeaders.get(id)!._getArrowViewState()).toEqual(
        viewState.viewState
      );
      expect(sortHeaders.get(id)!._getArrowDirectionState()).toEqual(
        viewState.arrowDirection
      );
    });
  }
}

class FakeDataSource extends DataSource<any> {
  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return collectionViewer.viewChange.pipe(map(() => []));
  }
  disconnect() {}
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource" aplsSort>
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderA apls-sort-header> Column A </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderB apls-sort-header> Column B </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.b}} </cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_c">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderC apls-sort-header> Column C </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.c}} </cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
    </cdk-table>
  `
})
class CdkTableAplsSortApp {
  @ViewChild(AplsSort) aplsSort: AplsSort;

  dataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
}

@Component({
  template: `
    <apls-table [dataSource]="dataSource" aplsSort>
      <ng-container aplsColumnDef="column_a">
        <apls-header-cell *aplsHeaderCellDef #sortHeaderA apls-sort-header> Column A </apls-header-cell>
        <apls-cell *aplsCellDef="let row"> {{row.a}} </apls-cell>
      </ng-container>

      <ng-container aplsColumnDef="column_b">
        <apls-header-cell *aplsHeaderCellDef #sortHeaderB apls-sort-header> Column B </apls-header-cell>
        <apls-cell *aplsCellDef="let row"> {{row.b}} </apls-cell>
      </ng-container>

      <ng-container aplsColumnDef="column_c">
        <apls-header-cell *aplsHeaderCellDef #sortHeaderC apls-sort-header> Column C </apls-header-cell>
        <apls-cell *aplsCellDef="let row"> {{row.c}} </apls-cell>
      </ng-container>

      <apls-header-row *aplsHeaderRowDef="columnsToRender"></apls-header-row>
      <apls-row *aplsRowDef="let row; columns: columnsToRender"></apls-row>
    </apls-table>
  `
})
class AplsTableAplsSortApp {
  @ViewChild(AplsSort) aplsSort: AplsSort;

  dataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
}

@Component({
  template: `<div apls-sort-header="a"> A </div>`
})
class AplsSortHeaderMissingAplsSortApp {}

@Component({
  template: `
    <div aplsSort>
      <div apls-sort-header="duplicateId"> A </div>
      <div apls-sort-header="duplicateId"> A </div>
    </div>
  `
})
class AplsSortDuplicateAplsSortableIdsApp {}

@Component({
  template: `
    <div aplsSort>
      <div apls-sort-header> A </div>
    </div>
  `
})
class AplsSortableMissingIdApp {}

@Component({
  template: `
    <div aplsSort aplsSortDirection="ascending">
      <div apls-sort-header="a"> A </div>
    </div>
  `
})
class AplsSortableInvalidDirection {}
