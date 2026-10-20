
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/core/services/alert.service';
import { PriceBookFiledData, SolutionData } from '../../../../brands';
import { BrandsApiService } from '../../../../brands-api.service';

@Component({
  selector: 'app-brand-solution-detail',
  templateUrl: './brand-solution-detail.component.html',
  styleUrls: ['./brand-solution-detail.component.scss']
})
export class BrandSolutionDetailComponent implements OnInit {

  constructor(
    private brandsAPI: BrandsApiService,
    private alert: AlertService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
  ) { }
  // 品牌ＩＤ
  brandId = '';

  // 品牌name
  brandName ='';



  filterStatus = 1;
  // 網頁模式判斷是否是新增或是編輯模式
  mode = '';

  // 方案資料
  solutionDatas = new SolutionData();
  // 方案ID
  solutionId = '';



  selected = new FormControl(0);

  tabs: PriceBookFiledData[] = [
    {
      name: 'price book',
      item: [
        {
          name: 'orderId',
          key: 'orderId',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'productId',
          key: 'productId',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'unit',
          key: 'unit',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'show name',
          key: 'show name',
          require: true,
          draggable: true,
          initial: false,
        },

        {
          name: 'unit desc',
          key: 'unit desc',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'unit price',
          key: 'unit price',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'excess price',
          key: 'excess price',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'limit',
          key: 'limit',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'change',
          key: 'change',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'untaxed price',
          key: 'untaxed price',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'hidden usage',
          key: 'hidden usage',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'monthCommit',
          key: 'monthCommit',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'mainIndex',
          key: 'mainIndex',
          require: true,
          draggable: true,
          initial: false,
        },
      ]
    },
    {
      name: 'subItem',
      item: [
        {
          name: 'orderId',
          key: 'orderId',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'productId',
          key: 'productId',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'unit',
          key: 'unit',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'subIndex',
          key: 'subIndex',
          require: true,
          draggable: true,
          initial: false,
        },
      ]
    },
    {
      name: 'customize',
      item: [
        {
          name: 'show name',
          key: 'show name',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'limit',
          key: 'limit',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'unit desc',
          key: 'unit desc',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'use',
          key: 'use',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'total use',
          key: 'total use',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'remaining usage',
          key: 'remaining usage',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'excess usage',
          key: 'excess usage',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'unit price',
          key: 'unit price',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'untaxed price',
          key: 'untaxed price',
          require: true,
          draggable: true,
          initial: false,
        },
        {
          name: 'hidden usage',
          key: 'hidden usage',
          require: true,
          draggable: true,
          initial: false,
        },
      ]
    },
  ];

  tabsName = '';

  ui = {
    isLoading: false
  }



  ngOnInit(): void {
    this.brandId = this.activatedRoute.snapshot.params['brand'];
    this.brandName = this.activatedRoute.snapshot.params['solution'];
    console.log(this.activatedRoute.snapshot.params);
    console.log('2222222222');
    if(this.activatedRoute.snapshot.params['edit'] === 'add') {
      this.mode = 'add';
    } else {
      this.mode = 'edit';
      this.solutionId = this.activatedRoute.snapshot.params['edit'];
      this.getSolutionAPI(this.brandId, this.solutionId);
    }
  }
  // 新增pricebook 類別
  addTab(){
    if(this.tabsName) {
      let index = new PriceBookFiledData();
      index.name = this.tabsName;
      this.tabs.push(index);
      this.selected.setValue(this.tabs.length - 1);
    }
  }

  // 取得方案資料內容
  getSolutionAPI (brandId: string, solution: string) {
    this.brandsAPI.getSolution(brandId, solution).subscribe({
      next: (res) => {
        console.log('[solution] getSolution done', res);
        if (res.info.success && res?.data) {
          this.solutionDatas = res.data;
          if(res.data.status === 'enable') {
            this.filterStatus = 1;
          } else {
            this.filterStatus = 0;
          }
          this.ui.isLoading = false;
        } else {
          this.ui.isLoading = false;
        }
      },
      error: (err) => {
        console.error('[solution] getSolution fail', err);
        this.alert.errorAlert('[solution] getSolution fail' + err);
        this.ui.isLoading = false;
      },
    });
  }

  // 儲存方案
  saveBrandApi() {
    // this.brandManagement.outputData();
    if(this.filterStatus === 1) {
      this.solutionDatas.status = 'enable'
    } else {
      this.solutionDatas.status = 'disable';
    }
    this.ui.isLoading = true;
    if(this.mode === 'edit') {
      this.brandsAPI.updateSolution(this.solutionDatas, this.activatedRoute.snapshot.params['brand'],this.activatedRoute.snapshot.params['edit']).subscribe({
        next: (res) => {
          console.log('[brands] addBrand done', res);
          if (res.info.success && res?.data) {
            this.alert.successAlert('方案編輯成功');
            location.reload();

            this.ui.isLoading = false;
          } else {
            this.ui.isLoading = false;
          }
        },
        error: (err) => {
          console.error('[brands] addBrand fail', err);
          this.alert.errorAlert('[brands] addBrand fail' + err);
          this.ui.isLoading = false;
        },
      });
    } else {

      let data = {
        name: this.solutionDatas.name
      }
      this.brandsAPI.addSolution(data, this.activatedRoute.snapshot.params['brand']).subscribe({
        next: (res) => {
          console.log('[brands] addBrand done', res);
          if (res.info.success && res?.data) {
            this.alert.successAlert('方案新增成功');
            this.route.navigate([`main/brands/${this.brandId}/${this.brandName}`]);

            // this.brandDatas = res.data;
            this.ui.isLoading = false;
          } else {
            this.ui.isLoading = false;
          }
        },
        error: (err) => {
          console.error('[brands] addBrand fail', err);
          this.alert.errorAlert('[brands] addBrand fail' + err);
          this.ui.isLoading = false;
        },
      });

    }

  }


  // 刪除pricebook類別
  removeTab(index: number) {
    this.tabs.splice(index, 1);
  }
}
