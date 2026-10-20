import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostingStorageComponent } from './posting-storage/posting-storage.component';
import { PostingListComponent } from './posting-list/posting-list.component';
const routes: Routes = [
  {
    path: '',
    component: PostingListComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostingRoutingModule { }
