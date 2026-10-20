import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartInfo, Commodity, CommodityCart } from 'src/app/core/models/commodity';
import { User } from 'src/app/core/models/users';
import { AuthService } from 'src/app/core/services/auth.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-commodity-shop-detail',
  templateUrl: './commodity-shop-detail.component.html',
  styleUrls: ['./commodity-shop-detail.component.scss'],
})
export class CommodityShopDetailComponent implements OnInit {
  @Input() commodity: Commodity = new Commodity();
  @Input() mode?: 'prev' | 'cart';

  /** 目前登入的使用者資訊 */
  currentUser: User | null;
  currentUserRoleId?: string;

  /** 標籤列表 */
  tagList: string[] = [];

  /** 目前的使用者 */
  get currentUserValue() {
    return this.authService.currentUserValue;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.currentUserRoleId = this.authService.currentUserValue?.role?.id;
    console.log(this.currentUser);
    console.log(this.currentUserRoleId);

  }

  ngOnInit(): void {
    console.log(this.commodity);
    this.getTagList();
  }

  getTagList() {
    if (this.commodity.tagList) {
      this.commodity.tagList.forEach(item => {
        this.tagList.push(item);
      });
    }
  }

  /** 跳轉至購物清單列表 */
  goToCart() {
    // 預覽情形下不跳轉
    if (this.mode && this.mode === 'prev') {
      return;
    }

    console.log(this.commodity);

    // 將商品存入 localStorage
    this.setToLocalStorage();

    // 跳轉
    this.router.navigate(['/main/commodity-shop/cart'], {
      relativeTo: this.route,
      state: { route: { internal: true } },
    });
  }

  /** 將紀錄存到 LocalStorage */
  setToLocalStorage() {
    let currentUserId: string | undefined = '';
    let currentUserRoleId: string | undefined = '';
    // 是否為訪客
    if (this.currentUserValue && this.currentUserValue.accessToken) {
      currentUserId = this.currentUser?.id;
      currentUserRoleId = this.currentUserRoleId;
    } else {
      currentUserId = 'guest';
      currentUserRoleId = 'guest';
    }
    // 是否有 localStorage 的紀錄
    const isShoppingRecord = localStorage.getItem('shoppingCart');
    // 解析 localStorage 的紀錄
    const userSoppingList: { userId: string, role: CartInfo[] }[] = isShoppingRecord ? JSON.parse(isShoppingRecord) : [];
    // 是否有這個使用者 的紀錄
    const userRecord = userSoppingList.find((item: { userId: string, role: CartInfo[] }) => item.userId === currentUserId);
    const userRecordIdx = userSoppingList.findIndex((item: { userId: string, role: CartInfo[] }) => item.userId === currentUserId);
    const getSoppingList = userRecord ? userRecord.role : [];
    // 是否有這筆 role 的紀錄
    const isRoleRecord = getSoppingList.length ? getSoppingList.find((item: CartInfo) => item.roleId === currentUserRoleId) : undefined;
    // 要存到 localStorage 的物件
    // const shoppingCartList: CartInfo[] = [];
    const shoppingCart: CartInfo = {
      roleId: currentUserRoleId ?? '',
      cartList: [],
    };
    const shoppingItem: CommodityCart = {
      productId: this.commodity.productId,
      productName: this.commodity.productName
    }

    console.log('isShoppingRecord:', isShoppingRecord);
    console.log('getSoppingList:', getSoppingList);
    console.log('isRoleRecord', isRoleRecord);


    // 如果還沒有紀錄 或 這個角色還未有紀錄，新增一筆紀錄
    if (!isShoppingRecord || !isRoleRecord) {
      console.log('還沒有紀錄 或 這個角色還未有紀錄');
      const newItem = _.cloneDeep(shoppingItem);
      newItem.purchaseQuantity = 1;
      shoppingCart.cartList?.push(newItem);
      getSoppingList.push(shoppingCart);

    } else if (isRoleRecord) {    // 這個 role 有紀錄
      // 是否已有這筆商品的紀錄
      const isItemRecord = isRoleRecord.cartList?.findIndex(element => element.productId === this.commodity.productId);
      const itemRecord = isRoleRecord.cartList?.find(element => element.productId === this.commodity.productId);

      console.log(isItemRecord);
      console.log(itemRecord);


      if (isItemRecord === -1) {
        console.log('沒有該商品紀錄');
        const newItem = _.cloneDeep(shoppingItem);
        newItem.purchaseQuantity = 1;
        isRoleRecord.cartList?.unshift(newItem);
      } else if (isItemRecord !== undefined && isItemRecord > -1 && itemRecord) {
        console.log('已經有該商品紀錄');
        const newItem = _.cloneDeep(itemRecord);
        newItem.purchaseQuantity = newItem.purchaseQuantity ? (newItem.purchaseQuantity + 1) : 1;
        isRoleRecord.cartList?.splice(isItemRecord, 1);
        isRoleRecord.cartList?.unshift(newItem);
      }

      //
      const roleRecord = getSoppingList.findIndex((item: CartInfo) => item.roleId === currentUserRoleId);
      getSoppingList.splice(roleRecord, 1, isRoleRecord);

      // 如果已有紀錄，先清掉舊的紀錄
      // localStorage.removeItem('shoppingCart');
    }


    const userShoppingRecord = {
      userId: currentUserId ?? '',
      role: getSoppingList
    };
    if (userRecord) {
      userSoppingList.splice(userRecordIdx, 1, userShoppingRecord);
    } else {
      userSoppingList.push(userShoppingRecord);
    }

    console.log('going to set localStorage', userSoppingList);
    localStorage.setItem('shoppingCart', JSON.stringify(userSoppingList));
  }

}
