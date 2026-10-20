import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import * as _ from 'lodash';

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'template',
    children: [{name: 'Apple'}, {name: 'Banana'}, {name: 'Fruit loops'}],
  },
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}


@Component({
  selector: 'app-solution-detail',
  templateUrl: './solution-detail.component.html',
  styleUrls: ['./solution-detail.component.scss']
})
export class SolutionDetailComponent implements OnInit {

  private _transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() { }

  treeDatas: FoodNode[] = [
    {
      name: 'template',
      children: [
        {
          name: 'akamailBasic.bundle.js'
        },
        {
          name: 'index.html'
        },
        {
          name: 'f571c5705060cfc777c9.jpg'
        },
        {
          name: 'd89ed1792f531efdeede.jpg'
        },
        {
          name: 'd6f32dc45b928e108ae7.jpg'
        },
        {
          name: 'akamailBasic.css'
        },
        {
          name: 'akamailBasic.bundle.js.LICENSE.txt'
        },
        {
          name: '8b9f3cc48b5f93c58c14.jpg'
        },
      ],
    }
  ]

  ngOnInit(): void {
    this.dataSource.data = this.treeDatas;
    console.log(this.dataSource);
    this.treeControl.expand(this.treeControl.dataNodes[0]);
  }

  testAdd() {
    this.treeDatas[0].children?.push({name: '1111111'});

    this.treeControl.expand(this.treeControl.dataNodes[0]);
  }

  testDetele(value: any) {
    if(this.treeDatas[0].children) {
      this.treeDatas[0].children = this.treeDatas[0].children.filter((item, itemIndex) => {
        return value.name !== item.name;
      });
      this.dataSource.data =  _.cloneDeep(this.treeDatas);
      this.treeControl.expand(this.treeControl.dataNodes[0]);
    }
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

}
