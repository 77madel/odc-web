import {Component, ViewChild} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup, Validators
} from "@angular/forms";
import {FullCalendarModule} from "@fullcalendar/angular";

import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ToastrService} from "ngx-toastr";
import {TypeActivite} from "@core/models/TypeActivite";
import {Activity} from "@core/models/Activity";
import {Entite} from "@core/models/Entite";
import {Salle} from "@core/models/Salle";
import {Etape} from "@core/models/Etape";
import {DatatableComponent, NgxDatatableModule, SelectionType} from "@swimlane/ngx-datatable";
import {GlobalService} from "@core/service/global.service";
import Swal from "sweetalert2";
import {NgForOf, NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-activity',
  imports: [
    FormsModule,
    FullCalendarModule,
    ReactiveFormsModule,
    NgIf,
    NgxDatatableModule,
    RouterLink,
    NgForOf,
  ],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss'
})
export class ActivityComponent {
  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;
  rows = [];
  activite:  Activity[] = [];
  entite:  Entite[] = [];
  etape:  Etape[] = [];
  salleId:  Salle[] = [];
  typeActivites:  TypeActivite[] = [];
  selectedEtapes: Etape[] = [];
  scrollBarHorizontal = window.innerWidth < 1200;
  selectedRowData!: selectActiviteInterface;
  filteredData: any[] = [];
  editForm: UntypedFormGroup;
  register!: UntypedFormGroup;
  loadingIndicator = true;
  isRowSelected = false;
  reorderable = true;
  public selected: number[] = [];
  columns = [
    { prop: 'nom' },
    { prop: 'titre' },
    { prop: 'lieu' },
    { prop: 'description' },
    { prop: 'dateDebut' },
    { prop: 'dateFin' },
    { prop: 'objectifParticipation' },
  ];

  @ViewChild(DatatableComponent, { static: false }) table2!: DatatableComponent;
  selection!: SelectionType;
  constructor(
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private glogalService: GlobalService
  ) {
    this.editForm = this.fb.group({
      id: new UntypedFormControl(),
      nom: new UntypedFormControl(),
      titre: new UntypedFormControl(),
      lieu: new UntypedFormControl(),
      description: new UntypedFormControl(),
      dateDebut: new UntypedFormControl(),
      dateFin: new UntypedFormControl(),
      objectifParticipation: new UntypedFormControl(),
      entite: new UntypedFormControl(),
      salleId: new UntypedFormControl(),
      etape: new UntypedFormControl(),
      selectedEtapeIds: new UntypedFormControl(),
    });
    window.onresize = () => {
      this.scrollBarHorizontal = window.innerWidth < 1200;
    };
    this.selection = SelectionType.checkbox;
  }

  // select record using check box
  onSelect({ selected }: { selected: any }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);

    if (this.selected.length === 0) {
      this.isRowSelected = false;
    } else {
      this.isRowSelected = true;
    }
  }

  deleteSelected() {
    Swal.fire({
      title: 'Voulez vous vraiment supprimer?',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: 'Oui',
    }).then((result) => {
      if (result.value) {
        this.selected.forEach((row) => {
          this.deleteRecord(row);
        });
        this.deleteRecordSuccess(this.selected.length);
        this.selected = [];
        this.isRowSelected = false;
      }
    });
  }

  ngOnInit() {
    this.getAllActivite();
    this.getAllEtape();
    this.getAllTypeActivite();
    this.getAllSalle();
    this.getAllEntite();

    this.register = this.fb.group({
      id: [''],
      nom: ['', [Validators.required]],
      titre: ['', [Validators.required]],
      lieu: ['', [Validators.required]],
      description: ['', [Validators.required]],
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]],
      objectifParticipation: [null, [Validators.required]],
      entite: [null, [Validators.required]],
      // etape: [null, [Validators.required]],
      salleId: [null, [Validators.required]],

    });
  }
  // fetch data
  getAllActivite(){
    this.loadingIndicator = true;
    this.glogalService.get('activite').subscribe({
      next:(value: Activity[]) =>{
        this.activite = value;
        this.filteredData = [...value];
        setTimeout(() =>{
          this.loadingIndicator = false;
        },500);
      }
    })
  }

  getAllEntite(){
    this.loadingIndicator = true;
    this.glogalService.get('entite').subscribe({
      next:(value: Entite[]) =>{
        this.entite = value;
        this.filteredData = [...value];
        setTimeout(() =>{
          this.loadingIndicator = false;
        },500);
      }
    })
  }

  getAllSalle(){
    this.loadingIndicator = true;
    this.glogalService.get('salle').subscribe({
      next:(value: Salle[]) =>{
        this.salleId = value;
        this.filteredData = [...value];
        setTimeout(() =>{
          this.loadingIndicator = false;
        },500);
      }
    })
  }

  getAllEtape(){
    this.loadingIndicator = true;
    this.glogalService.get('etape').subscribe({
      next:(value: Etape[]) =>{
        this.etape = value;
        this.filteredData = [...value];
        setTimeout(() =>{
          this.loadingIndicator = false;
        },500);
      }
    })
  }

  getAllTypeActivite(){
    this.loadingIndicator = true;
    this.glogalService.get('typeActivite').subscribe({
      next:(value: TypeActivite[]) =>{
        this.typeActivites = value;
        this.filteredData = [...value];
        setTimeout(() =>{
          this.loadingIndicator = false;
        },500);
      }
    })
  }

  onAddRowSave(form: UntypedFormGroup) {
    this.loadingIndicator = true;
    this.glogalService.post('activite', form.value).subscribe({
      next: (response) => {
        // Ajouter la nouvelle role reçue à la liste locale
        this.activite.push(response);
        console.log(this.activite)
        this.activite = [...this.activite];

        // Réinitialiser l'objet salles
        form.reset();
        // Fermer les modales si nécessaire
        this.modalService.dismissAll();

        // Afficher un toast de succès
        this.addRecordSuccess();
      },
      error: (err: { status: number; error: any; message?: string }) => {
        console.error('Erreur reçue:', err);

        let message = 'Une erreur est survenue. Veuillez réessayer.';
        let title = '<span class="text-red-500">Échec</span>';

        if (err.error?.message) {
          message = err.error.message;
        } else if (err.message) {
          message = err.message;
        }

        Swal.fire({
          icon: 'error',
          title: title,
          text: message,
          confirmButtonText: 'Ok',
          customClass: {
            confirmButton: 'bg-red-500 text-white hover:bg-red-600',
          },
        });
      },
      complete: () => {
        this.loadingIndicator = false;
      }
    });
  }


  // add new record
  addRow(content: any) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
    // this.register.patchValue({
    //   id: this.getId(10, 100),
    //   img: this.newUserImg,
    // });
  }

  selectedEtapeIds: number[] = [];
  // Lorsqu'on modifie la sélection des étapes
  onEtapesChange(selectedIds: number[]) {
    console.log('Etapes sélectionnées ont changé:', this.selectedEtapeIds);
    this.selectedEtapeIds = selectedIds;

    const filteredEtapes = this.etape.filter(etape =>
      etape && this.selectedEtapeIds.includes(etape.id!)
    );

    this.editForm.patchValue({
      etape: filteredEtapes.map(e => e.id),
    });
  }

  // edit record
  editRow(row: any, rowIndex: number, content: any) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
    // Préparer les IDs d'étapes sélectionnées
    this.selectedEtapeIds = row.etape?.map((e: any) => e.id) || [];
    this.editForm.patchValue({
      id: row.id,
      nom: row.nom,
      titre: row.titre,
      lieu: row.lieu,
      description: row.description,
      dateDebut: row.dateDebut,
      dateFin: row.dateFin,
      objectifParticipation: row.objectifParticipation,
      entite: row.entite?.id,
      // etape: row.etape?.id,
      etape: this.selectedEtapeIds,
      salleId: row.salleId?.id,
    });

    this.selectedRowData = row;
  }
  onEditSave(form: UntypedFormGroup) {
    console.log("modification",form.value);
    if (form?.value?.id) {
      // Préparer l'objet mis à jour (ici l'exemple suppose que `form.value` contient les nouvelles données)
      // const updatedActivite = form.value;
      const etapesObjects = (form.value.etape || []).map((id: number) => ({ id }));

      // Créer l'objet à envoyer au backend
      const updatedActivite = {
        ...form.value,
        etapes: etapesObjects,   // Remplace 'etape' ou 'selectedEtapeIds' par 'etapes'
      };

      this.glogalService.update("activite", updatedActivite.id, updatedActivite).subscribe({
        next: () => {
          this.modalService.dismissAll(); // Fermer le modal
          this.editRecordSuccess();       // Appeler callback si défini
          setTimeout(() =>{
            this.loadingIndicator = false;
          },500);
          this.getAllActivite();
        },
        error: (err: { status: number; error: any; message?: string }) => {
          console.error('Erreur lors de la mise à jour :', err);

          let message = 'Une erreur est survenue. Veuillez réessayer.';
          let title = '<span class="text-red-500">Échec</span>';

          if (err.error?.message) {
            message = err.error.message;
          } else if (err.message) {
            message = err.message;
          }

          Swal.fire({
            icon: 'error',
            title: title,
            text: message,
            confirmButtonText: 'Ok',
            customClass: {
              confirmButton: 'bg-red-500 text-white hover:bg-red-600',
            },
          });
        }
      });
    }
  }


  // delete single row
  deleteSingleRow(row: any) {
    Swal.fire({
      title: 'Voulez vous vraiment supprimer?',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: 'Oui',
    }).then((result) => {
      if (result.value) {
        this.deleteRecord(row);
        this.deleteRecordSuccess(1);
      }
    });
  }

  deleteRecord(row: any) {
    this.glogalService.delete("activite", row.id!).subscribe({
      next:(response) =>{
        this.activite = response;
        this.loadingIndicator = true;
        setTimeout(() =>{
          this.loadingIndicator = false;
        },500);
        this.getAllActivite();

      }, error: (err: { status: number; error: any; message?: string }) => {
        console.error('Erreur reçue:', err);

        let message = 'Une erreur est survenue. Veuillez réessayer.';
        let title = '<span class="text-red-500">Échec</span>';

        if (err.error?.message) {
          message = err.error.message;
        } else if (err.message) {
          message = err.message;
        }

        Swal.fire({
          icon: 'error',
          title: title,
          text: message,
          confirmButtonText: 'Ok',
          customClass: {
            confirmButton: 'bg-red-500 text-white hover:bg-red-600',
          },
        });
      }
    })
  }


  filterDatatable(event: any) {
    const val = event.target.value.toLowerCase();

    this.activite = this.filteredData.filter((item) => {
      return Object.values(item).some((field: any) =>
        field?.toString().toLowerCase().includes(val)
      );
    });

    this.table.offset = 0;
  }



  addRecordSuccess() {
    this.toastr.success('Adjonction réalisée avec succès.', '');
  }
  editRecordSuccess() {
    this.toastr.success('Modification opéré', '');
  }
  deleteRecordSuccess(count: number) {
    this.toastr.error(count + 'Eradication diligente pleinement consommée.', '');
  }

}

export interface selectActiviteInterface {
  nom: string;
  titre: string;
  lieu: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  objectifParticipation: number;
  entite: Entite;
  etape: Etape;
  salleId: Salle;
}

