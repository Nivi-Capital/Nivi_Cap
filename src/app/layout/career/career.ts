import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Main } from '../../service/main';
import { finalize, take } from 'rxjs/operators';
import { Router } from '@angular/router';

type FormStatusType = 'form' | 'loading' | 'success' | 'error';

export interface Job {
  id: number;
  title: string;
  type: string;
  description: string;
  KeySkills: string;
  Responsibilities: string;
  Qualifications: string;
  Preferred: string;
}

@Component({
  selector: 'app-career',
  imports: [CommonModule, HttpClientModule, FormsModule],
  standalone: true,
  templateUrl: './career.html',
  styleUrl: './career.css',
})
export class Career {
  uploadedFileName = signal<any | null>(null);
  selectedFile = signal<File | null>(null);
  fileName = signal<string | null>(null);
  msgtoshow: string = '';
  status: FormStatusType = 'form';
  isSubmitting: boolean = false;

  selectedJobTitle: string = '';
  selectedJobId: number | null = null;
  showFileInput = true
  fileInputKey = 0;
  @ViewChild('applicationForm') applicationForm!: NgForm;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;


  jobs = signal<Job[]>([
    {
      id: 1,
      title: 'Full Stack Developer',
      type: 'Build scalable, secure fintech applications with strong backend systems and seamless frontend experiences.',
      KeySkills: `<ul>
      <li>Java, Spring Boot, Microservices </li>
      <li>Angular, TypeScript  </li>
      <li>REST API development & third-party integrations  </li>
      <li>SQL & NoSQL (Oracle, MySQL, PostgreSQL, MongoDB)  </li>
      <li>Authentication & security (JWT, OAuth)  </li>
      <li>CI/CD (Jenkins, GitHub Actions, GitLab CI)  </li>
      <li>Docker, Kubernetes, Cloud (AWS/Azure/GCP)  </li>
      <li>Monitoring tools (ELK, Grafana, Prometheus)  </li>
      <li>Agile/Scrum; fintech/payments/KYC exposure preferred  </li>
      </ul>`,
      

      Responsibilities: `<ul>
      <li>Develop end-to-end web applications (frontend + backend). </li> 
      <li>Build secure, scalable APIs for fintech use cases (onboarding, KYC, payments, lending). </li>  
      <li>Design microservices-based architecture and optimize databases.  </li> 
      <li>Create responsive, high-performance UI using Angular.</li>   
      <li>Ensure system scalability, reliability, and high availability.  </li> 
      <li>Implement security best practices and ensure regulatory compliance.  </li> 
      <li>Integrate with external systems (KYC/AML, payment gateways, fintech partners). </li>  
      <li>Monitor, troubleshoot, and optimize performance. </li>  
      <li>Support CI/CD, deployments, and containerized environments.  </li> 
      <li>Maintain code quality, documentation, and collaborate cross-functionally.  </li> 
      <li>Own features end-to-end and drive continuous improvement.</li>   </ul>`,

      Qualifications: `<ul>
      <li>Bachelor’s/Master’s in Computer Science or related field  </li> 
      <li>3+ years in full-stack / backend / frontend development  </li>
      <li>Familiarity with fintech or financial services systems, including payments, KYC/AML, lending platforms, or transaction processing. </li> 
      <li>Experience working in Agile/Scrum development environments. </li></ul>`,

      Preferred: `<ul>
      
      <li>Experience with Node.js and Express.js for backend development. </li>
      <li>Exposure to event-driven or distributed systems (Kafka, RabbitMQ, etc.).</li> 
      <li>Hands-on experience with Docker, Kubernetes, and cloud platforms (AWS, Azure, or GCP). </li>
      <li>Knowledge of CI/CD pipelines using Jenkins, GitHub Actions, GitLab CI, or similar tools. </li>
      <li>Familiarity with monitoring and logging tools such as ELK Stack, Grafana, Prometheus, or New Relic. </li>
      <li>Understanding of security best practices, data privacy, and regulatory compliance in financial systems. </li>
      <li>Experience working with high-traffic, high-availability systems. </li>
      <li>Prior experience in a fintech, banking, NBFC, or payments domain. </li>
      <li>Immediate joiners preferred. </li>
</ul>`,
      description: 'We are looking for an expert to manage our global inventory systems and optimize supply chain flow.'
    },
    {
      id: 2,
      title: 'Engineering Manager',
      type: `Lead engineering delivery with a hands-on approach, driving scalable fintech systems while building and  mentoring high-performing teams.`,
      KeySkills: `<ul>
<li>Java, MEAN Stack (MongoDB, Express, Angular, Node.js), Flutter</li>
<li>System design, scalable architecture, cloud deployments </li>
<li>Oracle DB & backend frameworks </li>
<li>Code reviews, engineering best practices, CI/CD </li>
<li>Team leadership, mentoring, performance management </li>
<li>Agile/Scrum delivery & cross-functional collaboration </li>
<li>BFSI/fintech (lending, loan pricing, repayments, regulations) </li>
<li>Stakeholder management & leadership communication </li>
</ul>`,

      Responsibilities: `<ul>
<li>Lead hands-on development for critical features and architecture. </li>
<li>Drive system design for scalable, secure, high-performance applications. </li>
<li>Enforce coding standards, testing, CI/CD, and documentation practices. </li>
<li>Manage and mentor engineering teams; support hiring and growth.</li>
<li>Own end-to-end delivery with high-quality, on-time releases.</li>
<li>Collaborate with Product, Design, QA, and DevOps teams.</li>
<li>Identify and mitigate technical risks and bottlenecks.</li>
<li>Partner with CTO on technology roadmap and execution.</li>
<li>Provide regular updates, insights, and leadership reporting.</li>
</ul>`,
      Qualifications: `<ul>
<li>12–15 years of experience; 5+ years in Engineering Manager/Tech Lead role </li>
<li>Strong hands-on expertise in Java, Angular, Node.js, Flutter </li>
<li>Experience in scalable systems, cloud, and code reviews  </li>
<li>Strong Agile experience and stakeholder management </li>
<li>Proven experience in BFSI/fintech (lending domain preferred)</li>
</ul>`,
      Preferred: `<ul>
<li>AWS/Azure/GCP </li>
<li>DevOps, Docker, Kubernetes </li>
<li>Experience working closely with CTO/leadership</li>
 <li>Immediate joiners preferred. </li>
</ul>`,
      description: 'This is a full-time role is based in Andheri, Mumbai, with a 5-day work week (Work from office). Were looking for Immediate Joiners.Please feel free to share your resume at work@nivicap.com'
    },
    {
      id: 3,
      title: 'Program Manager',
      type: 'Drive large-scale fintech and lending programs end-to-end, ensuring alignment with business goals,  regulatory compliance, and high-quality execution.',
      KeySkills: `<ul>
<li>Program management (fintech, BFSI, NBFC)</li>
<li>Digital lending systems (LOS, LMS, credit lifecycle) </li>
<li>Agile/Scrum/SAFe/Hybrid delivery models </li>
<li>Stakeholder & vendor management </li>
<li>Risk, compliance, KYC/AML, regulatory knowledge </li>
<li>API integrations, fintech ecosystems </li>
<li>Strategic planning, execution, and governance</li>
</ul>`,

      Responsibilities: `<ul>
<li>Own end-to-end delivery of lending and fintech programs. </li>
<li>Define roadmap, milestones, dependencies, and KPIs.</li>
<li>Collaborate with Product, Engineering, Risk, Compliance, and partners. </li>
<li>Drive execution ensuring timely, cost-effective delivery. </li>
<li>Manage senior stakeholder communication and reporting. </li>
<li>Oversee integrations (LOS, LMS, KYC, AML, credit bureaus, APIs).</li>
<li>Ensure compliance with RBI and financial regulations.</li>
<li> Identify and mitigate risks, issues, and dependencies. </li>
<li>Establish governance, processes, and best practices.</li>
<li>Track performance, outcomes, and mentor delivery teams.</li>
</ul>`,

      Qualifications: `<ul>
<li>9+ years in Program/Project Management (BFSI/Fintech/NBFC)</li>
<li>Experience in digital lending platforms and large-scale programs</li>
<li>Strong knowledge of lending products and credit lifecycle</li>
<li>Experience with Agile/Hybrid delivery models</li>
<li>Excellent leadership and stakeholder management skills</li>
</ul>`,

      Preferred: `<ul>
<li>PMP, PgMP, PRINCE2, SAFe, Agile certifications </li>
<li>MBA or equivalent </li>
<li>Experience scaling fintech products </li>
<li>Exposure to cloud, data, and API-driven systems</li>
<li>Digital Lending & FinTech Domain Expertise, Risk & Compliance Awareness, Strategic Thinking & Execution Excellence.</li>
 <li>Immediate joiners preferred. </li>
</ul>`,
      description: 'This is a full-time role is based in Andheri, Mumbai, with a 5-day work week (Work from office). Were looking for Immediate Joiners.Please feel free to share your resume at work @nivicap.com'
    },

    {
      id: 4,
      title: 'Oracle Cloud Infrastructure Specialist',
      type: 'Deploy, migrate, and manage scalable, secure infrastructure on Oracle Cloud Infrastructure (OCI), ensuring high performance, automation, and reliability',
      KeySkills: `<ul>
<li>Oracle Cloud Infrastructure (OCI): Compute, Networking, Storage, IAM, Databases </li>
<li>Cloud migration & hybrid architecture (on-prem → OCI) </li>
<li>Networking: VCN, VPN, FastConnect, Load Balancers, WAF, Firewalls </li>
<li>Infrastructure as Code: Terraform, Ansible </li>
<li>Scripting: Python, Bash, PowerShell </li>
<li>Monitoring: OCI Monitoring, Logging, Prometheus, Grafana, ELK </li>
<li>CI/CD & DevOps: Jenkins, Git, Docker, Kubernetes </li>
<li>Security & compliance (IAM, vulnerability management) </li>
</ul>`,
      Responsibilities: `<ul>
<li>Deploy and manage OCI infrastructure (compute, storage, networking, databases). </li>
<li>Execute cloud migrations and support multi-region deployments. </li>
<li>Configure networking components (VCN, subnets, VPNs, FastConnect, load balancers). </li>
<li>Implement security controls (IAM, NSGs, firewalls, WAF). </li>
<li>Automate provisioning using Terraform, Ansible, and scripts. </li>
<li>Monitor, troubleshoot, and optimize performance and cost. </li>
<li>Provide L2/L3 support and participate in on-call rotations. </li>
<li>Ensure security compliance, patching, and vulnerability remediation. </li>
<li>Collaborate with DevOps, app, and DB teams; document SOPs and best practices. </li>
<li>Mentor junior engineers and drive operational excellence. </li>
</ul>`,

      Qualifications: `<ul>
<li>5–8 years of IT infrastructure experience; 3+ years in OCI </li>
<li>Strong expertise in OCI services (Compute, Networking, Storage, IAM, DB) </li>
<li>Hands-on with Terraform, Ansible, OCI CLI, and scripting </li>
<li>Experience with monitoring, logging, and troubleshooting tools </li>
<li> Knowledge of hybrid cloud environments and security best practices </li>
</ul>`,

      Preferred: `<ul>
<li>AWS/Azure/GCP exposure </li>
<li>OCI certifications (Architect, Operations, Security) </li>
<li>Experience with Exadata / Autonomous Database</li>
 <li>Immediate joiners preferred. </li>
</ul>`,
      description: 'This is a full-time role is based in Andheri, Mumbai, with a 5-day work week (Work from office). Were looking for Immediate Joiners.Please feel free to share your resume at work @nivicap.com'
    },

    {
      id: 5,
      title: 'Solution Architect',
      type: 'Design scalable, secure, and high-performance fintech solutions, driving architecture for lending platforms aligned  with business and regulatory requirements.',
      KeySkills: `<ul>
<li>Solution architecture, system design, microservices & API architecture </li>
<li>Cloud (OCI), distributed systems, event-driven architecture </li>
<li>BFSI/fintech domain (lending, payments, core banking) </li>
<li>Lending workflows (underwriting, KYC/AML, risk, collections) </li>
<li> Databases (Oracle), caching, messaging systems </li>
<li>Security & compliance (RBI, GDPR, SOC2, ISO 27001, IAM) </li>
<li> DevOps, CI/CD, Docker, Kubernetes </li>
<li> Stakeholder management & architecture governance </li>
<li> TOGAF certified </li>
</ul>`,
      Responsibilities: `<ul>
<li>Design end-to-end architecture for lending platforms (loans, payments, accounts). </li>
<li>Define APIs, microservices, data flows, and integration patterns. </li>
<li>Translate lending workflows into scalable technical solutions. </li>
<li>Architect systems for underwriting, risk, KYC/AML, disbursement, and collections. </li>
<li>Design and optimize cloud-native solutions on OCI. </li>
<li>Lead cloud migration, modernization, and infrastructure optimization. </li>
<li>Guide engineering teams on architecture, design standards, and best practices. </li>
<li>Conduct design reviews and provide architectural approvals. </li>
<li>Collaborate with business, product, engineering, and compliance teams. </li>
<li>Ensure compliance with regulatory and security standards. </li>
<li>Maintain architecture documentation, governance, and roadmaps. </li>
</ul>`,

      Qualifications: `<ul>
<li>Bachelor’s/Master’s in Engineering (Computer Science preferred) </li>
<li>6–10 years in solution architecture/system design </li>
<li>2–3 years in BFSI/core banking domain </li>
<li>Strong experience in fintech/lending platforms </li>
<li>Hands-on experience with OCI and cloud architectures </li>
<li>Expertise in microservices, APIs, distributed systems </li>
<li>Strong knowledge of databases, data modeling, and messaging systems </li>
<li>TOGAF certification (mandatory) </li>
<li>Experience working in Agile environments </li>
</ul>`,
      Preferred: `<ul>
<li>Experience with risk engines, rules engines, underwriting platforms </li>
<li>Design thinking approach </li>
<li>Knowledge of DevOps pipelines and cloud governance </li>
<li>Experience with KYC, bureau APIs, payment gateways </li>
<li>Strong communication and decision-making skills </li>
 <li>Immediate joiners preferred. </li>
</ul>`,
      description: 'This is a full-time role is based in Andheri, Mumbai, with a 5-day work week (Work from office). Were looking for Immediate Joiners.Please feel free to share your resume at work @nivicap.com'
    },

    {
      id: 6,
      title: 'Solution Architect',
      type: 'Design scalable, secure, and high-performance fintech solutions, driving architecture for lending platforms aligned  with business and regulatory requirements.',
      KeySkills: `<ul>
<li>Solution architecture, system design, microservices & API architecture </li>
<li>Cloud (OCI), distributed systems, event-driven architecture </li>
<li>BFSI/fintech domain (lending, payments, core banking) </li>
<li>Lending workflows (underwriting, KYC/AML, risk, collections) </li>
<li> Databases (Oracle), caching, messaging systems </li>
<li>Security & compliance (RBI, GDPR, SOC2, ISO 27001, IAM) </li>
<li> DevOps, CI/CD, Docker, Kubernetes </li>
<li> Stakeholder management & architecture governance </li>
<li> TOGAF certified </li>
</ul>`,
      Responsibilities: `<ul>
<li>Design end-to-end architecture for lending platforms (loans, payments, accounts). </li>
<li>Define APIs, microservices, data flows, and integration patterns. </li>
<li>Translate lending workflows into scalable technical solutions. </li>
<li>Architect systems for underwriting, risk, KYC/AML, disbursement, and collections. </li>
<li>Design and optimize cloud-native solutions on OCI. </li>
<li>Lead cloud migration, modernization, and infrastructure optimization. </li>
<li>Guide engineering teams on architecture, design standards, and best practices. </li>
<li>Conduct design reviews and provide architectural approvals. </li>
<li>Collaborate with business, product, engineering, and compliance teams. </li>
<li>Ensure compliance with regulatory and security standards. </li>
<li>Maintain architecture documentation, governance, and roadmaps. </li>
</ul>`,

      Qualifications: `<ul>
<li>Bachelor’s/Master’s in Engineering (Computer Science preferred) </li>
<li>6–10 years in solution architecture/system design </li>
<li>2–3 years in BFSI/core banking domain </li>
<li>Strong experience in fintech/lending platforms </li>
<li>Hands-on experience with OCI and cloud architectures </li>
<li>Expertise in microservices, APIs, distributed systems </li>
<li>Strong knowledge of databases, data modeling, and messaging systems </li>
<li>TOGAF certification (mandatory) </li>
<li>Experience working in Agile environments </li>
</ul>`,

      Preferred: `<ul>
<li>Experience with risk engines, rules engines, underwriting platforms </li>
<li>Design thinking approach </li>
<li>Knowledge of DevOps pipelines and cloud governance </li>
<li>Experience with KYC, bureau APIs, payment gateways </li>
<li>Strong communication and decision-making skills </li>
 <li>Immediate joiners preferred. </li>
</ul>`,
      description: 'This is a full-time role is based in Andheri, Mumbai, with a 5-day work week (Work from office). Were looking for Immediate Joiners.Please feel free to share your resume at work @nivicap.com'
    },

    {

      id: 7,
      title: 'Sr. Software Test Engineer',
      type: 'Ensure high-quality, scalable fintech products through strong manual and automation testing, driving end-to-end quality ownership across systems.',
      KeySkills: `<ul>
<li>Manual & Automation Testing (Selenium, Cypress, Playwright) </li>
<li>Test planning, strategy, and end-to-end test coverage </li>
<li>API testing (Postman), SQL, debugging & log analysis </li>
<li>Performance testing (JMeter, Locust) & VAPT </li>
<li>CI/CD integration for automated testing </li>
<li>Defect management (JIRA, Bugzilla, Azure DevOps) </li>
<li>Agile/Scrum methodologies </li>
<li>Leadership & mentoring </li>
</ul>`,
      Responsibilities: `<ul>
<li>Define test strategies, plans, scenarios, and test cases. </li>
<li>Own end-to-end test coverage (functional, UI, API, DB, performance, security). </li>
<li>Execute manual testing (functional, regression, UAT, exploratory). </li>
<li>Lead debugging, defect reproduction, and root cause analysis. </li>
<li>Design, build, and maintain automation frameworks and scripts. </li>
<li>Integrate automation into CI/CD for continuous testing. </li>
<li>Track, manage, and validate defects; act as quality gatekeeper. </li>
<li>Conduct performance testing and VAPT assessments. </li>
<li>Collaborate with cross-functional teams in Agile environments. </li>
<li>Mentor junior QA engineers and improve QA processes. </li>
<li>Drive continuous improvement in tools, frameworks, and practices. </li>
</ul>`,

      Qualifications: `<ul>
<li>Bachelor’s/Master’s in Computer Science or related field </li>
<li>5–8 years in software testing (manual + automation) </li>
<li>Strong knowledge of SDLC, STLC, and QA methodologies </li>
<li>Hands-on experience with automation, API testing, SQL, and debugging </li>
<li>Experience with performance testing and security testing </li>
<li>Strong analytical, communication, and leadership skills </li>
</ul>`,
      Preferred: `<ul> <li>Immediate joiners preferred. </li></ul>`,
      description: 'This is a full-time role is based in Andheri, Mumbai, with a 5-day work week (Work from office). Were looking for Immediate Joiners.Please feel free to share your resume at work @nivicap.com'
    }
  ]);

  constructor(private http: HttpClient, public main: Main,private router:Router) {
    }
  expandedJobId = signal<number | null>(null);

  toggleExpand(id: number) {
    this.expandedJobId.update(current => current === id ? null : id);
  }

  openApplyModal(item: any) {
    this.selectedJobTitle = item.title;
    this.selectedJobId = item.id;
  }
  // Handle file selection
  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);
      // this.fileName.set(file.name);
    }

  }


  submitResumeForm(data: NgForm) {

    if (this.isSubmitting || data.invalid || !this.selectedFile()) {
      return;
    }
    this.isSubmitting = true;
    this.status = 'loading';
    const fd = new FormData();
    fd.append('fullName', data.value.name);
    fd.append('mobileNumber', data.value.phone);
    fd.append('jobTitle', this.selectedJobTitle);
    fd.append('file', this.selectedFile() as File);

    this.main.submitResume(fd).pipe(
        take(1),
        finalize(() => {
          this.isSubmitting = false;
        })
      ).subscribe({


        next: (res) => {
          this.msgtoshow = res.message;
          this.status = 'success';
          this.isSubmitting = false;

          const modalEl = document.getElementById('staticBackdrop');
          if (modalEl) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
            modal?.hide();
          }

          data.resetForm();
          this.selectedFile.set(null);
          this.showFileInput = false;

          setTimeout(() => {
            this.showFileInput = true;
          });

          this.selectedJobTitle = '';
          this.selectedJobId = null;

          setTimeout(() => {
            this.status = 'form';
          }, 2000);


        },
        error: (err) => {
          this.msgtoshow =
            err.error?.message || 'Something went wrong. Please try again.';
          this.isSubmitting = false;
          this.status = 'error';

          setTimeout(() => {
            this.status = 'form';
          }, 5000);

        }
      });

  }

  closeModal1() {
    if (this.applicationForm) {
      this.applicationForm.resetForm();
    }
    this.selectedFile.set(null);
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

    this.selectedJobTitle = '';
    this.selectedJobId = null;
    this.isSubmitting = false;
  }

  closeModal() {
    if (this.applicationForm) {
      this.applicationForm.resetForm();
    }

    this.selectedFile.set(null);

    this.showFileInput = false;

    setTimeout(() => {
      this.showFileInput = true;
    });


    this.fileInputKey++;

    this.selectedJobTitle = '';
    this.selectedJobId = null;
    this.isSubmitting = false;
  }


}
