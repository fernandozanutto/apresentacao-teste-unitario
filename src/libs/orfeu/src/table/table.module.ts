/**
 * @license
 * Copyright Apollus EHS Solution Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { AplsTable } from './table';
import {
  AplsCell,
  AplsCellDef,
  AplsColumnDef,
  AplsFooterCell,
  AplsFooterCellDef,
  AplsHeaderCell,
  AplsHeaderCellDef
} from './cell';
import {
  AplsFooterRow,
  AplsFooterRowDef,
  AplsHeaderRow,
  AplsHeaderRowDef,
  AplsRow,
  AplsRowDef
} from './row';

export { AplsTable } from './table';
export {
  AplsCell,
  AplsCellDef,
  AplsColumnDef,
  AplsFooterCell,
  AplsFooterCellDef,
  AplsHeaderCell,
  AplsHeaderCellDef
} from './cell';
export {
  AplsFooterRow,
  AplsFooterRowDef,
  AplsHeaderRow,
  AplsHeaderRowDef,
  AplsRow,
  AplsRowDef
} from './row';
export { AplsTableDataSource } from './table-data-source';

const EXPORTED_DECLARATIONS = [
  // Table
  AplsTable,

  // Template defs
  AplsHeaderCellDef,
  AplsHeaderRowDef,
  AplsColumnDef,
  AplsCellDef,
  AplsRowDef,
  AplsFooterCellDef,
  AplsFooterRowDef,

  // Cell directives
  AplsHeaderCell,
  AplsCell,
  AplsFooterCell,

  // Row directions
  AplsHeaderRow,
  AplsRow,
  AplsFooterRow
];

@NgModule({
  imports: [CdkTableModule, CommonModule],
  exports: EXPORTED_DECLARATIONS,
  declarations: EXPORTED_DECLARATIONS
})
export class AplsTableModule {}
