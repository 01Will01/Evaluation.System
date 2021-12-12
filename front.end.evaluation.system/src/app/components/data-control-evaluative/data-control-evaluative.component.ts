import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-control-evaluative',
  templateUrl: './data-control-evaluative.component.html',
  styleUrls: ['./data-control-evaluative.component.css']
})
export class DataControlWeightComponent implements OnInit {

  public statusShowNote: boolean = false;
  public statusDataNoteView: boolean = false;

  public statusShowQuestion: boolean = false;
  public statusDataQuestionView: boolean = false;

  public statusShowCriterion: boolean = false;
  public statusDataCriterionView: boolean = false;

  public statusShowAreaCriterion: boolean = false;
  public statusDataAreaCriterionView: boolean = false;
  
  public statusShowEvaluationMarker: boolean = false;
  public statusDataEvaluationMarkerView: boolean = false;

  public statusDataDecisionView: boolean = false;
  public nameDataDecision: string = 'Selecione o dado';
  public userInfo: any;

  constructor() { }

  ngOnInit() {
    this.validationPermission();
  }

  checkOptionsDecision() {
    this.statusDataDecisionView = !this.statusDataDecisionView;
  }


  getselection(name: string) {
    switch (name) {
      case 'Escalas': { this.openNote(); break; }
      case 'Critérios': { this.openCriterion(); break; }
      case 'Área & Critério': { this.openAreaCriterion(); break; }
      case 'Questões': { this.openQuestion(); break; }
      case 'Marcador': { this.openEvaluationMarker(); break; }
    }

    this.checkOptionsDecision();
    this.nameDataDecision = name;
  }

  openNote() {
    this.statusShowNote = true;
    this.closeQuestion();
    this.closeCriterion();
    this.closeAreaCriterion();
    this.closeEvaluationMarker();
  }
  closeNote() { this.statusShowNote = false; }

  openQuestion() {
    this.statusShowQuestion = true;
    this.closeNote();
    this.closeCriterion();
    this.closeAreaCriterion();
    this.closeEvaluationMarker();
  }
  closeQuestion() { this.statusShowQuestion = false; }

  openCriterion() {
    this.statusShowCriterion = true;
    this.closeNote();
    this.closeQuestion();
    this.closeAreaCriterion();
    this.closeEvaluationMarker();
  }
  closeCriterion() { this.statusShowCriterion = false; }

  openAreaCriterion() {
    this.statusShowAreaCriterion = true;
    this.closeNote();
    this.closeQuestion();
    this.closeCriterion();
    this.closeEvaluationMarker();
  }
  closeAreaCriterion() { this.statusShowAreaCriterion = false; }

  openEvaluationMarker() {
    this.statusShowEvaluationMarker = true;
    this.closeNote();
    this.closeQuestion();
    this.closeCriterion();
    this.closeAreaCriterion();
  }
  closeEvaluationMarker() { this.statusShowEvaluationMarker = false; }



  validationPermission() {
    this.userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

    if (this.userInfo != null) {
      this.userInfo.permissions.forEach(element => {
        switch (element.id) {
          case '2': { 
                    this.statusDataNoteView = true;  
                    this.statusDataQuestionView = true; 
                    this.statusDataCriterionView = true; 
                    this.statusDataAreaCriterionView = true; 
                    this.statusDataEvaluationMarkerView = true; 
                    break; 
          }default: {
            break;
          }
        };
      });
    }
  }
}
  