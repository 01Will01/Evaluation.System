import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { EvaluationMarkersService } from 'src/app/services/evaluation-markers.service';
import { MatTableDataSource } from '@angular/material/table';
import { Observable} from "rxjs";
import { map, startWith } from "rxjs/operators";

export interface Marker {
  id: string;
  description: string;
  period: number;
  periodName: string;
  initialDate: string;
  endDate: string;
  limiteDate: string;
  registerDate: string;
  changeDate: string;
  statusCode: number;
  statusName: string;
}

export interface OptionsElements {
  id: number;
  name: string;
}

@Component({
  selector: 'app-evaluation-marker',
  templateUrl: './evaluation-marker.component.html',
  styleUrls: ['./evaluation-marker.component.css']
})
export class EvaluationMarkerComponent implements OnInit {

  public selectedInitialDate: Date | null;
  public selectedEndDate: Date | null;
  public selectedLitmitDate: Date | null;

  public filteredPeriod: Observable<Array<OptionsElements>>;

  public periodFilterCtrl: FormControl = new FormControl();

  public myControl = new FormControl();

  public periodSet: Array<OptionsElements> = [{id: 3, name: 'Trimestral'}, {id: 6, name: 'Semestral'}];

  public statusShowTable: boolean = false;
  public statusShowChange: boolean = false;
  public statusShowImport: boolean = false;
  public statusLoading: boolean = false;
  public statusMessage: boolean = false;
  public statusSuccess: boolean = false;
  public statusConfirmAction: boolean = false;

  public dataSource = new MatTableDataSource<Marker>()
  public displayedColumns: Array<string> = ["description", "period","intial","limit","end","status", "update"];
  public rows: Array<Marker> = [];
  public messages: Array<string> = [];
  public messageSuccess: string;
  public messageAction: string;
  public messageActionTwo: string = undefined;
  public messageActionThree: string = undefined;

  public formChange: FormGroup;
  public formImport: FormGroup;
  public toppings: FormGroup;

  public file: Set<File>;
  public progress: number = 0;

  public dataUser: any;

  //Controle de ações(Sim ou não)
  public accessAction: boolean;
  public accessActionRemove: boolean;
  public accessActionChange: boolean;
  public accessActionCheckBox: boolean;
  public idRemove: string;
  
  public dayInitial: number = 0;
  public dayLimit: number = 31;
  public dayLimitOld: number = 31;
  public dayEnd: number = 31;
  public monthInitial: number = 0;
  public monthLimit: number = 12;
  public monthLimitOld: number = 12;
  public monthEnd: number = 12;
  public yearInitial: number = 0;
  public yearLimit: number = 9999;
  public yearLimitOld: number = 9999;
  public yearEnd: number = 9999;
  
  public periodOld: number = 9999;



  public validatioDateLimit: boolean = true;

  public statusDateLimitShowMessage: boolean = false;

  public statusChangePeriod: boolean = false;
  public statusChangecheckBox: boolean = false;

  public showInterationPeriod: boolean = true;
  public showInterationDates: boolean = true;

  constructor(private formBuilder: FormBuilder, private markerService: EvaluationMarkersService ) { }

  ngOnInit() {
    this.getListMaker();
    this.formDeclaration();
    this.getDataUser();
    this.startSearchOptions();
  }
  
  getListMaker() {
    
    this.markerService.Get().subscribe(res => {
      if (res.success == true) {

        this.rows = res.data;

        this.rows.forEach((row) =>{ 
          row.periodName = (row.period == 6)? 'Semestral': 'Trimestral';
          row.statusName = (row.statusCode == 5)? 'Próximo Marcador': 'Atual';
        })

        this.dataSource = new MatTableDataSource(this.rows);

        this.statusLoading = false;
        this.openTable();

      } else {
        this.openTable();
        res.msg.forEach(mesage => { this.showMessageError(mesage.text); });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  change(row?: Marker) {
    this.formChange.controls.ID.setValue(row.id);
    this.formChange.controls.Description.setValue(row.description);
    this.formChange.controls.Period.setValue(row.period);
    this.formChange.controls.PeriodName.setValue(row.periodName);
    this.formChange.controls.StatusCode.setValue(row.statusCode);
    this.formChange.controls.StatusName.setValue(row.statusName);

    this.selectedInitialDate = new Date(`${row.initialDate.substring(3,5)}/${row.initialDate.substring(0,2)}/${row.initialDate.substring(6,10)}`);
    this.selectedEndDate = new Date(`${row.endDate.substring(3,5)}/${row.endDate.substring(0,2)}/${row.endDate.substring(6,10)}`);
    this.selectedLitmitDate = new Date(`${row.limiteDate.substring(3,5)}/${row.limiteDate.substring(0,2)}/${row.limiteDate.substring(6,10)}`);

    this.dayInitial = this.selectedInitialDate.getDate();
    this.monthInitial = this.selectedInitialDate.getMonth()+1;
    this.yearInitial = this.selectedInitialDate.getFullYear();
  
    this.dayLimitOld = this.selectedLitmitDate.getDate();
    this.monthLimitOld = this.selectedLitmitDate.getMonth()+1;
    this.yearLimitOld = this.selectedLitmitDate.getFullYear();
    
    this.dayEnd = this.selectedEndDate.getDate();
    this.monthEnd = this.selectedEndDate.getMonth()+1;
    this.yearEnd = this.selectedEndDate.getFullYear();
    
    this.showInterationPeriod = (row.statusCode == 1)? false: true;
    this.periodOld = row.period;

    this.formChange.controls.LimitDate.setValue(`${this.yearLimitOld}-${this.monthLimitOld}-${this.dayLimitOld}`);
    this.openChange();
  }

  dataRefresh(){
    this.getListMaker();
    this.showMessageSucceess('Tabela atualizada!');
  }

  refresh(){
    this.selectedInitialDate = new Date();
    this.selectedEndDate = new Date();
    this.selectedLitmitDate = new Date();

    this.dayInitial = this.selectedInitialDate.getDate();
    this.monthInitial = this.selectedInitialDate.getMonth()+1;
    this.yearInitial = this.selectedInitialDate.getFullYear();
  
    this.dayLimitOld = this.selectedLitmitDate.getDate();
    this.monthLimitOld = this.selectedLitmitDate.getMonth()+1;
    this.yearLimitOld = this.selectedLitmitDate.getFullYear();
    
    this.dayEnd = this.selectedEndDate.getDate();
    this.monthEnd = this.selectedEndDate.getMonth()+1;
    this.yearEnd = this.selectedEndDate.getFullYear();

    this.toppings.controls.isChangePeriodEnable.setValue(false);
    this.statusChangecheckBox = false
    this.showInterationPeriod = true;
    this.showInterationDates = true;

  }

  addEventLimit(type, event) {
    if(event.value){
        this.dayLimit = event.value.getDate();
        this.monthLimit = event.value.getMonth()+1;
        this.yearLimit = event.value.getFullYear();

        let data = this.ValidationDate()

        if(data.initial.status == false || data.end.status == false){
          this.statusDateLimitShowMessage = true;
          let message = data.initial.message;
          message += data.end.message;

          this.showMessageError(message);

          this.validatioDateLimit = false;

          this.selectedLitmitDate = new Date(`${this.monthLimitOld}/${this.dayLimitOld}/${this.yearLimitOld}`);
        }
        else{

          this.dayLimitOld = event.value.getDate();
          this.monthLimitOld = event.value.getMonth()+1;
          this.yearLimitOld = event.value.getFullYear();

          this.validatioDateLimit = true;

          this.selectedLitmitDate = new Date(`${this.monthLimit}/${this.dayLimit}/${this.yearLimit}`);

          this.formChange.controls.LimitDate.setValue(`${this.yearLimit}-${this.monthLimit}-${this.dayLimit}`);
        }
    }
  }


  getFile(event) {
    if (event != '' || event != null) {
      const selectedFiles = <FileList>event.srcElement.files;
      const fileNames = [];
      this.file = new Set();
      for (let i = 0; i < selectedFiles.length; i++) {
        fileNames.push(selectedFiles[i].name);
        this.file.add(selectedFiles[i]);
      }
      this.progress = 0;
    }
  }

  getDataUser() {
    this.dataUser = JSON.parse(sessionStorage.getItem("userInfo"));
  }

  getValueAction(value: boolean) {
    this.accessAction = value;

    switch (true) {
      case this.accessActionRemove: {
        this.ActionRemove(this.idRemove);
        break;
      }
      case this.accessActionCheckBox: {
        this.ActionEnableCheckBoxChangePeriod();
        break;
      }
    }
  }

  showMessageError(message: string) {
    this.statusLoading = false;
    this.statusMessage = true;
    this.messages.push(message);

    setTimeout(() => {
      this.statusMessage = false;
      this.statusDateLimitShowMessage = false;
      this.messages = Array<string>();
    }, 4000);
  }

  showMessageSucceess(message: string) {
    this.statusLoading = false;
    this.messageSuccess = message;
    this.statusSuccess = true;

    setTimeout(() => {
      this.statusSuccess = false;
      this.messageSuccess = '';
    }, 2000);
  }

  delete(row?: Marker) {
    this.accessActionRemove = true;
    this.idRemove = row.id;
    this.messageAction = 'Realmente quer remover a área ' + row.description + '?';
    this.openConfirmAction();
  }

  changeCheckBox() {
    this.accessActionCheckBox = true;
    
    this.messageAction = 'ATENÇÃO: Atualizar o perído do marcador atual pode gerar conflitos na avaliação atual.';
    this.messageActionTwo = ' Pois as datas de inicio, limite e fim da avaliação serão reajustadas.';
    this.messageActionThree = 'Realmente quer forçar a atualização do período?';
    this.openConfirmAction();
  }

  ActionRemove(value: string) {

    this.accessActionRemove = false;
    this.idRemove = '0';
    this.messageAction = '';
    this.closeConfirmAction();
    this.statusLoading = true;

    if (this.accessAction) {
      this.markerService.Remove(value).subscribe(res => {
        this.statusLoading = false;
        if (res.success == true) {

          this.showMessageSucceess('Área removida!');
          setTimeout(() => { this.getListMaker();}, 1500);

        } else {
          this.openTable();
          res.msg.forEach(message => { this.showMessageError(message.text); });
        }
      });
    } else { this.showMessageSucceess('Ok!'); }
  }
  
  ActionEnableCheckBoxChangePeriod() {
    this.closeConfirmAction();       
    this.statusChangecheckBox = (this.accessAction)? true: false;
    
    if(!this.statusChangecheckBox)
      this.toppings.controls.isChangePeriodEnable.setValue(this.statusChangePeriod);

    this.accessActionCheckBox = false;
    this.showInterationPeriod = this.statusChangecheckBox;
  }

  inputChange() {
    this.statusLoading = true;
    if (this.formChange.controls.Period.valid && this.formChange.controls.LimitDate.valid) {
      this.markerService.Change(this.formChange.controls.ID.value, this.formChange.controls.LimitDate.value, this.formChange.controls.Period.value, this.formChange.controls.StatusCode.value, this.statusChangePeriod).subscribe(res => {
        if (res.success == true) {

          this.showMessageSucceess('Marcador atualizado!');
          setTimeout(() => { this.getListMaker();}, 1500);

        } else { setTimeout(() => { this.getListMaker();}, 1500); res.msg.forEach(message => { this.showMessageError(message.text); }); }
      });
      this.statusChangePeriod = false;
    } else { this.showMessageError('Preencha os campos obrigatórios!'); }
  }

  inputImport() {
    this.statusLoading = true;
    this.formImport.controls.File.setValue(this.file)

    //  res.data.forEach(data => { this.showMessageError.push(data.message);});

    this.showMessageSucceess('Importação solicitada!');
    this.showMessageError('TESTEEEEEEE MESSAGEM DE ERRO!');
    this.getListMaker();
  }

  startSearchOptions() {
    this.filteredPeriod = this.periodFilterCtrl.valueChanges.pipe(
      startWith(""),
      map(value => this.filterPeriod(value))
    );

    this.formChange.controls.PeriodName.valueChanges.pipe(
      startWith(""),
      map(value => this.periodFilterCtrl.setValue(value))
    );

    this.formChange.get("PeriodName").valueChanges.subscribe(value => {
      setTimeout(() => {
        this.periodFilterCtrl.setValue(value);  //shows the latest first name
      })
    });

    this.formChange.controls.Period.valueChanges.pipe(
      startWith(""),
      map(value => this.periodFilterCtrl.setValue((value == 6)? 'Semestral': 'Trimestral'))
    );

    this.formChange.get("Period").valueChanges.subscribe(value => {
      setTimeout(() => {
        this.showInterationDates = (this.periodOld == value)? true: false;
        this.statusChangePeriod = (this.periodOld == value)? false: true;
        console.log('is change period:',this.statusChangePeriod)
        this.periodFilterCtrl.setValue((value == 6)? 'Semestral': 'Trimestral');  //shows the latest first name
      })
    });

    this.toppings.get("isChangePeriodEnable").valueChanges.subscribe(value => {
      setTimeout(() => {
        console.log('is change checkbox', value)

        if( value == true){
          this.changeCheckBox();
        }else{
          this.statusChangecheckBox = false; 
          this.showInterationPeriod = this.statusChangecheckBox;
        }
      });
    });
  }

  filterPeriod(value): Array<OptionsElements> {
    let asValue = value.toString().toLowerCase();
    return this.periodSet.filter( option =>
       option.id.toString().toLowerCase().indexOf(asValue) === 0 ||
       option.name.toString().toLowerCase().indexOf(asValue) === 0);
  }

  openTable() {
    this.statusShowTable = true;
    this.closeChange();
    this.closeImport();
    this.refresh();
  }
  closeTable() { this.statusShowTable = false; }

  openChange() {
    this.statusShowChange = true;
    this.closeTable();
    this.closeImport();
  }
  closeChange() { this.statusShowChange = false; }

  openImport() {
    this.statusShowImport = true;
    this.closeTable();
    this.closeChange();
    this.formDeclaration();
  }
  closeImport() { this.statusShowImport = false; }

  openConfirmAction() { this.statusConfirmAction = true; }
  closeConfirmAction() { this.statusConfirmAction = false; }

  formDeclaration() {
    this.formChange = this.formBuilder.group({
      ID: [null, Validators.required]
      ,Description: [null, Validators.required]
      ,LimitDate: [null, Validators.required]
      ,Period: [null, Validators.required]
      ,PeriodName: [null, Validators.required]
      ,StatusCode: [null, Validators.required]
      ,StatusName: [null, Validators.required]
    });

    this.formImport = this.formBuilder.group({
      File: [null, Validators.required]
      , TypeImport: [null, Validators.required]
    });
    
    this.toppings = this.formBuilder.group({
      isChangePeriodEnable: false,
      isChangePeriodInWaiting: false
    });
  }

  checkLoading() {
    this.statusLoading = !this.statusLoading;
  }

  ValidationDate(){
  
    let valueadjustedLimitEnd = { status:false, message: ''};
    let valueadjustedLimitInitial = { status:false, message: ''};

    if(this.yearLimit == this.yearEnd){
      valueadjustedLimitEnd = 
      (this.monthEnd - this.monthLimit < 0)? { status:false, message: 'Data limite precisa ser menor que a data de finalização. '}:  
      (this.monthEnd - this.monthLimit == 0 && this.dayLimit > 15)? { status:false, message: 'Data limite precisa ter menos de 15 dias corridos em relação a data de finalização. '}: 
      (this.monthEnd - this.monthLimit == 0 && this.dayLimit <= 15)? { status:true, message: ''}: 
      (this.monthEnd - this.monthLimit > 0)? { status:true, message: ''}:
      { status:false, message: ''};
    }
    else
      valueadjustedLimitEnd = { status:false, message: 'Ano diferente do esperado.'};
    
    if(this.yearLimit == this.yearInitial){

      valueadjustedLimitInitial = 
      (this.monthInitial - this.monthLimit > 0)? { status:false, message: 'Data limite precisa ser maior que a data de inicialização. '}:  
      (this.monthInitial - this.monthLimit == 0 && this.dayLimit < 15)? { status:false, message: 'Data limite precisa ter mais de 15 dias corridos em relação a data de inicialização. '}: 
      (this.monthInitial - this.monthLimit == 0 && this.dayLimit >= 15)? { status:true, message: ''}: 
      (this.monthInitial - this.monthLimit < 0)? { status:true, message: ''}:
      { status:false, message: ''};
    }
    

     return {
       initial:valueadjustedLimitEnd,
       end: valueadjustedLimitInitial
     }
  }
}
