import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ColaboratorService } from 'src/app/services/colaborator.service';
import { AreaService } from 'src/app/services/area.service';
import { DepartmentService } from 'src/app/services/department.service';
import { ResponsibilityService } from 'src/app/services/responsibility.service';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, ReplaySubject, Subject } from "rxjs";
import { map, startWith, take, takeUntil } from "rxjs/operators";

export interface CollaboratorElements {
  id: string;
  name: string;
  email: string;
  password: string;
  evaluatorName: string;
  evaluatorId: string;
  areaName: string;
  areaId: string;
  responsibilityName: string;
  responsibilityId: string;
  registerDate: string;
  changeDate: string;
  statusCode: number;
}

export interface OptionsElements {
  id: string;
  name: string;
}


export interface OptionsEvaluatorElements {
  id: string;
  name: string;
  responsibilityName: string;
  areaId: string;
}

@Component({
  selector: 'app-collaborator',
  templateUrl: './collaborator.component.html',
  styleUrls: ['./collaborator.component.css']
})

export class CollaboratorComponent implements OnInit {
  public myControl = new FormControl();

  toppings: FormGroup;


  public filteredEvaluator: Observable<Array<OptionsEvaluatorElements>>;
  public filteredLocal: Observable<Array<OptionsElements>>;
  public filteredDepartment: Observable<Array<OptionsElements>>;
  public filteredArea: Observable<Array<OptionsElements>>;
  public filteredResponsibility: Observable<Array<OptionsElements>>;
  public filteredProfile: Observable<Array<OptionsElements>>;

  public evaluatorFilterCtrl: FormControl = new FormControl();
  public localFilterCtrl: FormControl = new FormControl();
  public departmentFilterCtrl: FormControl = new FormControl();
  public areaFilterCtrl: FormControl = new FormControl();
  public responsibilityFilterCtrl: FormControl = new FormControl();
  public profileFilterCtrl: FormControl = new FormControl();

  public statusShowTable: boolean = false;
  public statusShowTableUserDisabled: boolean = false;
  public statusShowChange: boolean = false;
  public statusShowInput: boolean = false;
  public statusShowImport: boolean = false;
  public statusLoading: boolean = false;
  public statusMessage: boolean = false;
  public statusSuccess: boolean = false;
  public statusConfirmAction: boolean = false;

  public dataSource = new MatTableDataSource<CollaboratorElements>()
  public dataSourceUserDisabled = new MatTableDataSource<CollaboratorElements>()
  
  public displayedColumns: string[] = ["name", "e-mail", "evaluatorName", "update", "remove"];
  public displayedColumnsUserDisabled: string[] = ["name", "e-mail", "activate"];
  
  public rowsCollaborator: CollaboratorElements[] = [];
  public rowsUserDisabled: CollaboratorElements[] = [];

  public evaluatorSet: Array<OptionsEvaluatorElements> = [];
  public evaluatorBackupSet: Array<OptionsEvaluatorElements> = [];
  public localSet: Array<OptionsElements> = [];
  public areaSet: Array<OptionsElements> = [];
  public responsibilitySet: Array<OptionsElements> = [];
  public profileSet: Array<OptionsElements> = [];

  public messages: Array<string> = []
  public messageSuccess: string;
  public messageAction: string;

  public formInput: FormGroup;
  public formChange: FormGroup;
  public formImport: FormGroup;

  public file: Set<File>;
  public progress: number = 0;

  public dataUser: any;
  
  public oldEmail: string;

  //Controle de ações(Sim ou não)
  public accessAction: boolean;
  public accessActionRemove: boolean;
  public idRemove: string;

  constructor(private formBuilder: FormBuilder, private collaboratorService: ColaboratorService, private areaService: AreaService, private responsibilityService: ResponsibilityService) { }

  ngOnInit() {
    this.getListCollaborator();
    this.ListsUpdate();
    this.formDeclaration();
    this.getDataUser();
    this.startSearchOptions();
    this.openTable();
  }

  ListsUpdate() {
    this.getListEvaluator();
    this.getListArea();
    this.getListResponsibility();
    this.getListUserDisabled();
  }

  getListCollaborator() {
    this.statusLoading = true;
    let userActive = true; 
    this.collaboratorService.Get(userActive).subscribe(res => {
      if (res.success == true) {

        this.rowsCollaborator = res.data;
        this.dataSource = new MatTableDataSource([...this.rowsCollaborator]);

        this.statusLoading = false;
      } else {
        res.msg.forEach(message => { this.showMessageError(message.text); });
      }
    });
  }
 
  getListUserDisabled() {
    let userActive = false; 
    this.collaboratorService.Get(userActive).subscribe(res => {
        this.rowsUserDisabled = res.data;
        this.dataSourceUserDisabled = new MatTableDataSource([...this.rowsUserDisabled]);
    });
  }

  getListEvaluator() {
    var row: OptionsEvaluatorElements;
    var list: Array<OptionsEvaluatorElements> = [];
    let userActive = true; 
    list.push({ name: 'Não há', id: undefined, responsibilityName: 'Indeterminado', areaId: '0' });
    this.collaboratorService.Get(userActive).subscribe(res => {
      if (res.success == true) {
        res.data.forEach(element => {
          row = {
            id: element.id,
            name: element.name,
            responsibilityName: element.responsibilityName,
            areaId: element.areaId
          };
          if (row != undefined) { list.push(row); }
        });
        this.evaluatorSet = [...list];
        this.evaluatorBackupSet = [...list];
      }
    });
  }

  getListArea() {
    let row: OptionsElements;
    let list: Array<OptionsElements> = [];
    this.areaService.Get().subscribe(res => {
      if (res.success == true) {
        res.data.forEach(function (element) {
          row = {
            name: element.name,
            id: element.id
          };
          if (row) { list.push(row); }
        });
        this.areaSet = list;
      }
    });
  }

  getListResponsibility() {
    let row: OptionsElements;
    let list: Array<OptionsElements> = [];
    this.responsibilityService.Get().subscribe(res => {
      if (res.success == true) {
        res.data.forEach(function (element) {
          row = {
            name: element.name,
            id: element.id
          };
          if (row) { list.push(row); }
        });
        this.responsibilitySet = list;
      }
    });
  }

  getDataUser() {
    this.dataUser = JSON.parse(sessionStorage.getItem("userInfo"));
  }

  restartArrayOptions() {
    this.evaluatorSet = this.evaluatorBackupSet;
  }

  change(row?: CollaboratorElements) {
    this.restartArrayOptions();

    this.evaluatorSet = this.evaluatorSet.filter(option => option.id != row.id);
    
    this.formChange.controls.ID.setValue(row.id);
    this.formChange.controls.Collaborator.setValue(row.name);
    this.formChange.controls.Password.setValue('');
    this.formChange.controls.Email.setValue(row.email);
    this.formChange.controls.EvaluatorId.setValue(row.evaluatorId);
    this.formChange.controls.EvaluatorName.setValue(row.evaluatorName);
    this.formChange.controls.AreaId.setValue(row.areaId);
    this.formChange.controls.AreaName.setValue(row.areaName);
    this.formChange.controls.ResponsibilityId.setValue(row.responsibilityId);
    this.formChange.controls.ResponsibilityName.setValue(row.responsibilityName);
    this.formChange.controls.DateRegister.setValue(row.registerDate);

    this.oldEmail = row.email;

    this.openChange();
  }
  
  activate(row?: CollaboratorElements) {
    console.log(row)

    this.collaboratorService.activate(row.id).subscribe(res => {
      if (res.success == true) {

        this.showMessageSucceess('Usuário Ativado!');

        setTimeout(() => {
          this.getListCollaborator();
          this.ListsUpdate();
          this.openTableUserDisabled();
        }, 1500);

      } else { res.msg.forEach(message => { this.showMessageError(message.text); console.log(message); }); }
    });
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

  getValueAction(value: boolean) {
    this.accessAction = value;

    switch (true) {
      case this.accessActionRemove: {
        this.ActionRemove(this.idRemove);
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
      this.messages = Array<string>();
    }, 10000);
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

  delete(row?: CollaboratorElements) {
    this.accessActionRemove = true;
    this.idRemove = row.id;
    this.messageAction = 'Realmente quer remover o(a) colaborador(a) ' + row.name + '?';
    this.openConfirmAction();
  }

  ActionRemove(value: string) {

    this.accessActionRemove = false;
    this.idRemove ='0';
    this.messageAction = '';
    this.closeConfirmAction();
    this.statusLoading = true;

    if (this.accessAction) {
      this.collaboratorService.Remove(value, this.dataUser.id).subscribe(res => {
        this.statusLoading = false;
        if (res.success == true) {

          this.showMessageSucceess('Remoção concluída!');
          setTimeout(() => {
            this.getListCollaborator();
            this.ListsUpdate();
            this.openTable();
          }, 1500);

        } else {
          this.openTable();
          
          res.msg.forEach(message => { this.showMessageError(message.text); });
        }
      });
    } else { this.showMessageSucceess('Ok!'); }
  }

  inputChange() {
    this.statusLoading = true;
    let statusPassword = (this.toppings.controls.isChangePassword.value)? this.formChange.controls.Password.valid: true;
    let statusEmail = (this.toppings.controls.isChangeEmail.value)? this.formChange.controls.Email.valid: true;

    if(this.oldEmail == this.formChange.controls.Email.value && this.toppings.controls.isChangeEmail.value){
      statusEmail = false;

      this.showMessageError('É necessário atualizar o e-mail ou marcar a opção para não atualizar o e-mail');
    }

    if (this.formChange.controls.Collaborator.valid && this.formChange.controls.Email.valid && this.formChange.controls.AreaId.valid && this.formChange.controls.ResponsibilityId.valid && statusPassword && statusEmail) {
      this.collaboratorService.
        Change(
          this.dataUser.id,
          this.formChange.controls.ID.value,
          this.formChange.controls.Collaborator.value,
          this.formChange.controls.Email.value,
          this.formChange.controls.Password.value,
          this.formChange.controls.EvaluatorId.value,
          this.formChange.controls.AreaId.value,
          this.formChange.controls.ResponsibilityId.value,
          this.toppings.controls.isChangePassword.value,
          this.toppings.controls.isChangeEmail.value

        ).subscribe(res => {
          if (res.success == true) {

            this.showMessageSucceess('Aualização concluída!');

            setTimeout(() => {
              this.getListCollaborator();
              this.ListsUpdate();
              this.openTable();
            }, 1500);

          } else { res.msg.forEach(message => { this.showMessageError(message.text); console.log(message); }); }
        });
    } else { this.showMessageError('Campos obrigatórios não estão válidos'); }
  }

  inputRegister() {
    this.statusLoading = true;
    
    if (this.formInput.controls.Collaborator.valid && this.formInput.controls.Email.valid && this.formInput.controls.AreaId.valid && this.formInput.controls.ResponsibilityId.valid && this.toppings.controls.isChangePassword.valid) {
      this.collaboratorService.
        Input(
          this.dataUser.id,
          this.formInput.controls.Collaborator.value,
          this.formInput.controls.Email.value,
          this.formInput.controls.Password.value,
          this.formInput.controls.EvaluatorId.value,
          this.formInput.controls.AreaId.value,
          this.formInput.controls.ResponsibilityId.value,
        ).subscribe(res => {
          if (res.success == true) {

            this.showMessageSucceess('Cadastro concluído!');
            
            setTimeout(() => {
              this.getListCollaborator();
              this.ListsUpdate();
              this.openTable();
            }, 1500);
            
          } else { res.msg.forEach(message => { this.showMessageError(message.text); }); }
        });
    } else { this.showMessageError('Preencha os campos obrigatórios'); }
  }

  inputImport() {
    this.statusLoading = true;
    this.formImport.controls.File.setValue(this.file)

    console.log('dados de submição de importação', this.formImport.controls.File.value);

    this.showMessageSucceess('Importação solicitada!');
    this.getListCollaborator();
    this.openTable();
  }

  startSearchOptions() {

    this.formChange.controls.EvaluatorName.valueChanges.pipe(
      startWith(""),
      map(value => this.evaluatorFilterCtrl.setValue(value))
    );

    this.filteredEvaluator = this.evaluatorFilterCtrl.valueChanges.pipe(
      startWith(""),
      map(value => this.filterEvaluator(value))
    );

    this.formChange.controls.AreaName.valueChanges.pipe(
      startWith(""),
      map(value => this.areaFilterCtrl.setValue(value))
    );

    this.filteredArea = this.areaFilterCtrl.valueChanges.pipe(
      startWith(""),
      map(value => this.filterArea(value))
    );

    this.formChange.controls.ResponsibilityName.valueChanges.pipe(
      startWith(""),
      map(value => this.responsibilityFilterCtrl.setValue(value))
    );

    this.filteredResponsibility = this.responsibilityFilterCtrl.valueChanges.pipe(
      startWith(""),
      map(value => this.filterResponsibility(value))
    );
  }

  filterEvaluator(value: string = ''): Array<OptionsEvaluatorElements> {
    const filterValue = value.toLowerCase();
    return this.evaluatorSet.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  filterArea(value: string = ''): Array<OptionsElements> {
    const filterValue = value.toLowerCase();
    return this.areaSet.filter(
      option => option.name.toLowerCase().indexOf(filterValue) === 0
    );
  }

  filterResponsibility(value: string = ''): Array<OptionsElements> {
    const filterValue = value.toLowerCase();
    return this.responsibilitySet.filter(
      option => option.name.toLowerCase().indexOf(filterValue) === 0
    );
  }

  checkLoading() {
    this.statusLoading = !this.statusLoading;
  }

  openTable() {
    this.statusShowTable = true;
    this.closeChange();
    this.closeRegister();
    this.closeImport();
    this.closeTableUserDisabled();
  }
  closeTable() { this.statusShowTable = false; }
 
  openTableUserDisabled() {
    this.statusShowTableUserDisabled = true;
    this.closeChange();
    this.closeRegister();
    this.closeImport();
    this.closeTable();
  }
  closeTableUserDisabled() { this.statusShowTableUserDisabled = false; }

  openChange() {
    this.statusShowChange = true;
    this.closeTable();
    this.closeRegister();
    this.closeImport();
    this.startSearchOptions();
    this.closeTableUserDisabled();
  }
  closeChange() { this.statusShowChange = false; }

  openRegister() {
    this.statusShowInput = true;
    this.closeTable();
    this.closeChange();
    this.closeImport();
    this.formDeclaration();
    this.startSearchOptions();
    this.closeTableUserDisabled();
  }
  closeRegister() { this.statusShowInput = false; }

  openImport() {
    this.statusShowImport = true;
    this.closeTable();
    this.closeChange();
    this.closeRegister();
    this.formDeclaration();
    this.restartArrayOptions();
    this.closeTableUserDisabled();
  }
  closeImport() { this.statusShowImport = false; }

  openConfirmAction() { this.statusConfirmAction = true; }
  closeConfirmAction() { this.statusConfirmAction = false; }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
 
  applyFilterUserDisabled(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceUserDisabled.filter = filterValue.trim().toLowerCase();
  }

  formDeclaration() {
    this.formChange = this.formBuilder.group({
      ID: [null, Validators.required]
      , Collaborator: [null, Validators.required]
      , Password: [null, Validators.required]
      , Email: [null, Validators.required]
      , EvaluatorId: [null]
      , EvaluatorName: [null]
      , AreaId: [null, Validators.required]
      , AreaName: [null, Validators.required]
      , ResponsibilityId: [null, Validators.required]
      , ResponsibilityName: [null, Validators.required]
      , DateRegister: [null, Validators.required]
    });

    this.formInput = this.formBuilder.group({
      Collaborator: [null, Validators.required]
      , Password: [null, Validators.required]
      , Email: [null, Validators.required]
      , EvaluatorId: [null]
      , EvaluatorName: [null]
      , AreaId: [null, Validators.required]
      , AreaName: [null, Validators.required]
      , ResponsibilityId: [null, Validators.required]
      , ResponsibilityName: [null, Validators.required]
    });

    this.formImport = this.formBuilder.group({
      File: [null, Validators.required]
      , TypeImport: [null, Validators.required]
    });

    this.toppings = this.formBuilder.group({
      isChangePassword: false,
      isChangeEmail: false
    });

  }
}
