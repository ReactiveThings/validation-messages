import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'testcase',
  templateUrl: './testcase.component.html',
  styleUrls: ['./testcase.component.css']
})
export class TestcaseComponent implements OnInit {
  @Input()
  public name : string;
  constructor() { }

  ngOnInit() {
  }

}
