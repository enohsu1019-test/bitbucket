export class Brands {
  createDate = '';
  brandId = '';
  modifyDate = '';
  status = '';
  serviceName = '';
  name = '';
}


export class PostingList{
  checkStatus = false;
  lockInvoiceDate = ''
  billingPeriod = ''
  id = '';
  erpNumber = '';
  invoiceId = '';
  postingStatus = '';
  createTime = '';
  modifyTime = '';
  message = '';
  cloudId = '';
  customer = '';
  endUser = '';
  brand = '';
  brandId = '';
  createUser = {
    id: '',
    employeeId: '',
    email: '',
    name: '',
  };
  modifyUser = {
    id: '',
    employeeId: '',
    email: '',
    name: '',
  };
}

export class PutFormat{
  id:string[] = [];
  postingStatus = '';
  message = '';
}

export class FileRecordList {
  id = '';
  name = '';
  fileName = '';
  invoiceIdList: string[] = [];
  createUserId = '';
  createTime = '';
  createUser = {
    id: '',
    employeeId: '',
    email: '',
    name: '',
  }
}
