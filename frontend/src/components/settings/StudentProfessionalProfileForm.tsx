import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { generateStudentPDF } from '@/utils/pdf.utils';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Save,
  Loader2,
  Download,
  X,
  Check,
  Eye,
} from 'lucide-react';
import { useMyStudent, useUpdateMyStudent } from '@/hooks/useStudents';
import { useToast } from '@/hooks/useToast';
import { ProfessionalProfileView } from '@/components/students/ProfessionalProfileView';
import type {
  WorkExperience,
  Education,
  ProfessionalProfile,
} from '@/types/student.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface WorkExperienceFormData {
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface EducationFormData {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

interface LanguageFormData {
  name: string;
  level: string;
}

interface CertificationFormData {
  name: string;
  issuer: string;
  date: string;
  expiryDate: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  technologies: string;
  url: string;
}

export function StudentProfessionalProfileForm() {
  const { data: student, isLoading } = useMyStudent();
  const updateStudentMutation = useUpdateMyStudent();
  const { success, error: showError } = useToast();

  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [professionalProfile, setProfessionalProfile] =
    useState<ProfessionalProfile>({});

  const [editingWorkExp, setEditingWorkExp] = useState<number | null>(null);
  const [editingEducation, setEditingEducation] = useState<number | null>(null);
  const [editingLanguage, setEditingLanguage] = useState<number | null>(null);
  const [editingCertification, setEditingCertification] = useState<number | null>(
    null,
  );
  const [editingProject, setEditingProject] = useState<number | null>(null);

  const [newSkill, setNewSkill] = useState('');
  const [showWorkExpDialog, setShowWorkExpDialog] = useState(false);
  const [showEducationDialog, setShowEducationDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showCertificationDialog, setShowCertificationDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const workExpForm = useForm<WorkExperienceFormData>({
    defaultValues: {
      company: '',
      position: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
    },
  });

  const educationForm = useForm<EducationFormData>({
    defaultValues: {
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    },
  });

  const languageForm = useForm<LanguageFormData>({
    defaultValues: {
      name: '',
      level: '',
    },
  });

  const certificationForm = useForm<CertificationFormData>({
    defaultValues: {
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
    },
  });

  const projectForm = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      technologies: '',
      url: '',
    },
  });

  useEffect(() => {
    if (student) {
      const pp = student.professionalProfile || {};
      setWorkExperiences(pp.workExperience || []);
      setEducation(pp.education || []);
      setSkills(pp.skills || []);
      setProfessionalProfile(pp);
    }
  }, [student]);

  const handleAddWorkExperience = useCallback(() => {
    setEditingWorkExp(null);
    workExpForm.reset({
      company: '',
      position: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
    });
    setShowWorkExpDialog(true);
  }, [workExpForm]);

  const handleEditWorkExperience = useCallback(
    (index: number) => {
      const exp = workExperiences[index];
      setEditingWorkExp(index);
      workExpForm.reset({
        company: exp.company,
        position: exp.position,
        description: exp.description || '',
        startDate: exp.startDate.split('T')[0],
        endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
        isCurrent: exp.isCurrent || false,
      });
      setShowWorkExpDialog(true);
    },
    [workExperiences, workExpForm],
  );

  const handleSaveWorkExperience = useCallback(() => {
    const data = workExpForm.getValues();
    if (!data.company || !data.position || !data.startDate) {
      showError('Error', 'Completa los campos requeridos');
      return;
    }

    const newExp: WorkExperience = {
      company: data.company,
      position: data.position,
      description: data.description,
      startDate: new Date(data.startDate).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      isCurrent: data.isCurrent,
    };

    if (editingWorkExp !== null) {
      const updated = [...workExperiences];
      updated[editingWorkExp] = newExp;
      setWorkExperiences(updated);
    } else {
      setWorkExperiences([...workExperiences, newExp]);
    }

    setShowWorkExpDialog(false);
    setEditingWorkExp(null);
    workExpForm.reset();
  }, [workExpForm, editingWorkExp, workExperiences, showError]);

  const handleDeleteWorkExperience = useCallback(
    (index: number) => {
      setWorkExperiences(workExperiences.filter((_, i) => i !== index));
    },
    [workExperiences],
  );

  const handleAddEducation = useCallback(() => {
    setEditingEducation(null);
    educationForm.reset({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    });
    setShowEducationDialog(true);
  }, [educationForm]);

  const handleEditEducation = useCallback(
    (index: number) => {
      const edu = education[index];
      setEditingEducation(index);
      educationForm.reset({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field || '',
        startDate: edu.startDate.split('T')[0],
        endDate: edu.endDate ? edu.endDate.split('T')[0] : '',
        isCurrent: edu.isCurrent || false,
        description: edu.description || '',
      });
      setShowEducationDialog(true);
    },
    [education, educationForm],
  );

  const handleSaveEducation = useCallback(() => {
    const data = educationForm.getValues();
    if (!data.institution || !data.degree || !data.startDate) {
      showError('Error', 'Completa los campos requeridos');
      return;
    }

    const newEdu: Education = {
      institution: data.institution,
      degree: data.degree,
      field: data.field,
      startDate: new Date(data.startDate).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      isCurrent: data.isCurrent,
      description: data.description,
    };

    if (editingEducation !== null) {
      const updated = [...education];
      updated[editingEducation] = newEdu;
      setEducation(updated);
    } else {
      setEducation([...education, newEdu]);
    }

    setShowEducationDialog(false);
    setEditingEducation(null);
    educationForm.reset();
  }, [educationForm, editingEducation, education, showError]);

  const handleDeleteEducation = useCallback(
    (index: number) => {
      setEducation(education.filter((_, i) => i !== index));
    },
    [education],
  );

  const handleAddSkill = useCallback(() => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  }, [newSkill, skills]);

  const handleDeleteSkill = useCallback(
    (index: number) => {
      setSkills(skills.filter((_, i) => i !== index));
    },
    [skills],
  );

  const handleAddLanguage = useCallback(() => {
    setEditingLanguage(null);
    languageForm.reset({ name: '', level: '' });
    setShowLanguageDialog(true);
  }, [languageForm]);

  const handleEditLanguage = useCallback(
    (index: number) => {
      const lang = professionalProfile.languages?.[index];
      if (lang) {
        setEditingLanguage(index);
        languageForm.reset({ name: lang.name, level: lang.level });
        setShowLanguageDialog(true);
      }
    },
    [professionalProfile.languages, languageForm],
  );

  const handleSaveLanguage = useCallback(() => {
    const data = languageForm.getValues();
    if (!data.name || !data.level) {
      showError('Error', 'Completa todos los campos');
      return;
    }

    const languages = professionalProfile.languages || [];
    const newLang = { name: data.name, level: data.level };

    if (editingLanguage !== null) {
      const updated = [...languages];
      updated[editingLanguage] = newLang;
      setProfessionalProfile({ ...professionalProfile, languages: updated });
    } else {
      setProfessionalProfile({
        ...professionalProfile,
        languages: [...languages, newLang],
      });
    }

    setShowLanguageDialog(false);
    setEditingLanguage(null);
    languageForm.reset();
  }, [languageForm, editingLanguage, professionalProfile, showError]);

  const handleDeleteLanguage = useCallback(
    (index: number) => {
      const languages = professionalProfile.languages || [];
      setProfessionalProfile({
        ...professionalProfile,
        languages: languages.filter((_, i) => i !== index),
      });
    },
    [professionalProfile],
  );

  const handleAddCertification = useCallback(() => {
    setEditingCertification(null);
    certificationForm.reset({
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
    });
    setShowCertificationDialog(true);
  }, [certificationForm]);

  const handleEditCertification = useCallback(
    (index: number) => {
      const cert = professionalProfile.certifications?.[index];
      if (cert) {
        setEditingCertification(index);
        certificationForm.reset({
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date.split('T')[0],
          expiryDate: cert.expiryDate ? cert.expiryDate.split('T')[0] : '',
        });
        setShowCertificationDialog(true);
      }
    },
    [professionalProfile.certifications, certificationForm],
  );

  const handleSaveCertification = useCallback(() => {
    const data = certificationForm.getValues();
    if (!data.name || !data.issuer || !data.date) {
      showError('Error', 'Completa los campos requeridos');
      return;
    }

    const certifications = professionalProfile.certifications || [];
    const newCert = {
      name: data.name,
      issuer: data.issuer,
      date: new Date(data.date).toISOString(),
      expiryDate: data.expiryDate
        ? new Date(data.expiryDate).toISOString()
        : undefined,
    };

    if (editingCertification !== null) {
      const updated = [...certifications];
      updated[editingCertification] = newCert;
      setProfessionalProfile({
        ...professionalProfile,
        certifications: updated,
      });
    } else {
      setProfessionalProfile({
        ...professionalProfile,
        certifications: [...certifications, newCert],
      });
    }

    setShowCertificationDialog(false);
    setEditingCertification(null);
    certificationForm.reset();
  }, [
    certificationForm,
    editingCertification,
    professionalProfile,
    showError,
  ]);

  const handleDeleteCertification = useCallback(
    (index: number) => {
      const certifications = professionalProfile.certifications || [];
      setProfessionalProfile({
        ...professionalProfile,
        certifications: certifications.filter((_, i) => i !== index),
      });
    },
    [professionalProfile],
  );

  const handleAddProject = useCallback(() => {
    setEditingProject(null);
    projectForm.reset({
      name: '',
      description: '',
      technologies: '',
      url: '',
    });
    setShowProjectDialog(true);
  }, [projectForm]);

  const handleEditProject = useCallback(
    (index: number) => {
      const proj = professionalProfile.projects?.[index];
      if (proj) {
        setEditingProject(index);
        projectForm.reset({
          name: proj.name,
          description: proj.description || '',
          technologies: proj.technologies?.join(', ') || '',
          url: proj.url || '',
        });
        setShowProjectDialog(true);
      }
    },
    [professionalProfile.projects, projectForm],
  );

  const handleSaveProject = useCallback(() => {
    const data = projectForm.getValues();
    if (!data.name) {
      showError('Error', 'El nombre del proyecto es requerido');
      return;
    }

    const projects = professionalProfile.projects || [];
    const newProj = {
      name: data.name,
      description: data.description,
      technologies: data.technologies
        ? data.technologies.split(',').map((t) => t.trim())
        : undefined,
      url: data.url,
    };

    if (editingProject !== null) {
      const updated = [...projects];
      updated[editingProject] = newProj;
      setProfessionalProfile({ ...professionalProfile, projects: updated });
    } else {
      setProfessionalProfile({
        ...professionalProfile,
        projects: [...projects, newProj],
      });
    }

    setShowProjectDialog(false);
    setEditingProject(null);
    projectForm.reset();
  }, [projectForm, editingProject, professionalProfile, showError]);

  const handleDeleteProject = useCallback(
    (index: number) => {
      const projects = professionalProfile.projects || [];
      setProfessionalProfile({
        ...professionalProfile,
        projects: projects.filter((_, i) => i !== index),
      });
    },
    [professionalProfile],
  );

  const handleSaveAll = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  const handleConfirmSave = useCallback(() => {
    const updateData = {
      professionalProfile: {
        ...professionalProfile,
        workExperience: workExperiences,
        education: education,
        skills: skills,
      },
    };

    updateStudentMutation.mutate(updateData, {
      onSuccess: () => {
        success('Éxito', 'Perfil profesional actualizado correctamente');
        setShowConfirmDialog(false);
      },
      onError: () => {
        showError('Error', 'No se pudo actualizar el perfil profesional');
      },
    });
  }, [
    workExperiences,
    education,
    skills,
    professionalProfile,
    updateStudentMutation,
    success,
    showError,
  ]);

  const handleGeneratePDF = useCallback(async () => {
    if (!student) return;

    try {
      await generateStudentPDF(student, {
        ...professionalProfile,
        workExperience: workExperiences,
        education,
        skills,
      });
      success('Éxito', 'PDF generado correctamente');
    } catch (error: any) {
      showError('Error', `No se pudo generar el PDF: ${error.message}`);
    }
  }, [student, workExperiences, education, skills, professionalProfile, success, showError]);

  if (isLoading) {
    return (
      <Card className="border-2 border-slate-200 dark:border-slate-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const isPending = updateStudentMutation.isPending;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Mi Perfil Profesional</CardTitle>
                <CardDescription className="mt-1">
                  Construye tu perfil profesional y genera tu hoja de vida
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowPreviewDialog(true)}
                variant="outline"
                className="gap-2"
                disabled={isPending}
              >
                <Eye className="h-4 w-4" />
                Ver
              </Button>
              <Button
                onClick={handleGeneratePDF}
                variant="outline"
                className="gap-2"
                disabled={isPending}
              >
                <Download className="h-4 w-4" />
                Generar PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="summary">
              <AccordionTrigger>Resumen Profesional</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Label htmlFor="summary">Resumen</Label>
                  <Textarea
                    id="summary"
                    placeholder="Escribe un resumen profesional..."
                    value={professionalProfile.summary || ''}
                    onChange={(e) =>
                      setProfessionalProfile({
                        ...professionalProfile,
                        summary: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="work-experience">
              <AccordionTrigger>
                Experiencia Laboral ({workExperiences.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Button
                    onClick={handleAddWorkExperience}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Experiencia
                  </Button>
                  {workExperiences.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No hay experiencia laboral registrada
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {workExperiences.map((exp, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold">{exp.position}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {exp.company}
                              </p>
                              {exp.description && (
                                <p className="text-sm mt-2">{exp.description}</p>
                              )}
                              <p className="text-xs text-slate-500 mt-2">
                                {new Date(exp.startDate).toLocaleDateString()} -{' '}
                                {exp.isCurrent
                                  ? 'Presente'
                                  : exp.endDate
                                    ? new Date(exp.endDate).toLocaleDateString()
                                    : 'No especificado'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditWorkExperience(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteWorkExperience(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="education">
              <AccordionTrigger>
                Formación Académica ({education.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Button
                    onClick={handleAddEducation}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Formación
                  </Button>
                  {education.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No hay formación académica registrada
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {education.map((edu, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold">{edu.degree}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {edu.institution}
                              </p>
                              {edu.field && (
                                <p className="text-sm mt-1">{edu.field}</p>
                              )}
                              {edu.description && (
                                <p className="text-sm mt-2">{edu.description}</p>
                              )}
                              <p className="text-xs text-slate-500 mt-2">
                                {new Date(edu.startDate).toLocaleDateString()} -{' '}
                                {edu.isCurrent
                                  ? 'Presente'
                                  : edu.endDate
                                    ? new Date(edu.endDate).toLocaleDateString()
                                    : 'No especificado'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditEducation(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteEducation(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="skills">
              <AccordionTrigger>Habilidades ({skills.length})</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Agregar habilidad"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button onClick={handleAddSkill} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {skills.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No hay habilidades registradas
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => handleDeleteSkill(index)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="languages">
              <AccordionTrigger>
                Idiomas ({professionalProfile.languages?.length || 0})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Button
                    onClick={handleAddLanguage}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Idioma
                  </Button>
                  {(!professionalProfile.languages ||
                    professionalProfile.languages.length === 0) ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No hay idiomas registrados
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {professionalProfile.languages.map((lang, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">{lang.name}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {lang.level}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditLanguage(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteLanguage(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="certifications">
              <AccordionTrigger>
                Certificaciones ({professionalProfile.certifications?.length || 0})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Button
                    onClick={handleAddCertification}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Certificación
                  </Button>
                  {(!professionalProfile.certifications ||
                    professionalProfile.certifications.length === 0) ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No hay certificaciones registradas
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {professionalProfile.certifications.map((cert, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold">{cert.name}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {cert.issuer}
                              </p>
                              <p className="text-xs text-slate-500 mt-2">
                                {new Date(cert.date).toLocaleDateString()}
                                {cert.expiryDate &&
                                  ` - Expira: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditCertification(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteCertification(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="projects">
              <AccordionTrigger>
                Proyectos ({professionalProfile.projects?.length || 0})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Button
                    onClick={handleAddProject}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Proyecto
                  </Button>
                  {(!professionalProfile.projects ||
                    professionalProfile.projects.length === 0) ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No hay proyectos registrados
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {professionalProfile.projects.map((proj, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold">{proj.name}</h4>
                              {proj.description && (
                                <p className="text-sm mt-2">{proj.description}</p>
                              )}
                              {proj.technologies && proj.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {proj.technologies.map((tech, techIndex) => (
                                    <span
                                      key={techIndex}
                                      className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {proj.url && (
                                <a
                                  href={proj.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary mt-2 block"
                                >
                                  {proj.url}
                                </a>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditProject(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteProject(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-end mt-6 pt-6 border-t">
            <Button onClick={handleSaveAll} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Professional Profile Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Briefcase className="h-5 w-5 text-primary" />
              Vista Previa — Mi Perfil Profesional
            </DialogTitle>
            <DialogDescription>
              Así se ve tu perfil profesional actualmente
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <ProfessionalProfileView
              profile={{
                ...professionalProfile,
                workExperience: workExperiences,
                education,
                skills,
              }}
              studentName={student ? `${student.firstName} ${student.lastName}` : undefined}
              studentEmail={student?.email}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Work Experience Dialog */}
      <Dialog open={showWorkExpDialog} onOpenChange={setShowWorkExpDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWorkExp !== null ? 'Editar' : 'Agregar'} Experiencia Laboral
            </DialogTitle>
            <DialogDescription>
              Completa la información de tu experiencia laboral
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">
                Empresa <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company"
                {...workExpForm.register('company', { required: true })}
                placeholder="Nombre de la empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">
                Cargo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="position"
                {...workExpForm.register('position', { required: true })}
                placeholder="Cargo o posición"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...workExpForm.register('description')}
                placeholder="Describe tus responsabilidades y logros"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Fecha de Inicio <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...workExpForm.register('startDate', { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Finalización</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...workExpForm.register('endDate')}
                  disabled={workExpForm.watch('isCurrent')}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCurrent"
                {...workExpForm.register('isCurrent')}
                className="rounded"
              />
              <Label htmlFor="isCurrent">Trabajo Actual</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWorkExpDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveWorkExperience}>
              <Check className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Education Dialog */}
      <Dialog open={showEducationDialog} onOpenChange={setShowEducationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEducation !== null ? 'Editar' : 'Agregar'} Formación Académica
            </DialogTitle>
            <DialogDescription>
              Completa la información de tu formación académica
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institution">
                Institución <span className="text-destructive">*</span>
              </Label>
              <Input
                id="institution"
                {...educationForm.register('institution', { required: true })}
                placeholder="Nombre de la institución"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree">
                Título o Grado <span className="text-destructive">*</span>
              </Label>
              <Input
                id="degree"
                {...educationForm.register('degree', { required: true })}
                placeholder="Título obtenido"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field">Campo de Estudio</Label>
              <Input
                id="field"
                {...educationForm.register('field')}
                placeholder="Campo de estudio"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eduStartDate">
                  Fecha de Inicio <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="eduStartDate"
                  type="date"
                  {...educationForm.register('startDate', { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eduEndDate">Fecha de Finalización</Label>
                <Input
                  id="eduEndDate"
                  type="date"
                  {...educationForm.register('endDate')}
                  disabled={educationForm.watch('isCurrent')}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="eduIsCurrent"
                {...educationForm.register('isCurrent')}
                className="rounded"
              />
              <Label htmlFor="eduIsCurrent">En Curso</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eduDescription">Descripción</Label>
              <Textarea
                id="eduDescription"
                {...educationForm.register('description')}
                placeholder="Información adicional"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEducationDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEducation}>
              <Check className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Language Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLanguage !== null ? 'Editar' : 'Agregar'} Idioma
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="langName">
                Idioma <span className="text-destructive">*</span>
              </Label>
              <Input
                id="langName"
                {...languageForm.register('name', { required: true })}
                placeholder="Ej: Inglés, Español"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="langLevel">
                Nivel <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="level"
                control={languageForm.control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="langLevel">
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Básico">Básico</SelectItem>
                      <SelectItem value="Intermedio">Intermedio</SelectItem>
                      <SelectItem value="Avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLanguageDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveLanguage}>
              <Check className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certification Dialog */}
      <Dialog
        open={showCertificationDialog}
        onOpenChange={setShowCertificationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCertification !== null ? 'Editar' : 'Agregar'} Certificación
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="certName">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="certName"
                {...certificationForm.register('name', { required: true })}
                placeholder="Nombre de la certificación"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certIssuer">
                Emisor <span className="text-destructive">*</span>
              </Label>
              <Input
                id="certIssuer"
                {...certificationForm.register('issuer', { required: true })}
                placeholder="Organización emisora"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certDate">
                  Fecha <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="certDate"
                  type="date"
                  {...certificationForm.register('date', { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certExpiryDate">Fecha de Expiración</Label>
                <Input
                  id="certExpiryDate"
                  type="date"
                  {...certificationForm.register('expiryDate')}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCertificationDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveCertification}>
              <Check className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Dialog */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProject !== null ? 'Editar' : 'Agregar'} Proyecto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projName">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="projName"
                {...projectForm.register('name', { required: true })}
                placeholder="Nombre del proyecto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projDescription">Descripción</Label>
              <Textarea
                id="projDescription"
                {...projectForm.register('description')}
                placeholder="Describe el proyecto"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projTechnologies">Tecnologías</Label>
              <Input
                id="projTechnologies"
                {...projectForm.register('technologies')}
                placeholder="Separadas por comas (ej: React, Node.js, MongoDB)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projUrl">URL</Label>
              <Input
                id="projUrl"
                type="url"
                {...projectForm.register('url')}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProjectDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveProject}>
              <Check className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Save Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Cambios</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas guardar los cambios en tu perfil
              profesional?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmSave} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


