import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TablesPageRoutingModule } from './tables-routing.module';

import { TablesPage } from './tables.page';
import { TableDetailsPageModule } from '../table-details/table-details.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TablesPageRoutingModule,
  ],
  declarations: [TablesPage]
})
export class TablesPageModule {}
