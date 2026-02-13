import { lazy } from 'react';

// project-imports
import MainLayout from 'layout/MainLayout';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';
import { PermissionGuard } from 'utils/route-guard/PermissionGuard';
// import Header from 'layout/CommonLayout/Header'; 
import Login from 'pages/auth/auth1/login';
import WebinarFeedbackForm from 'pages/webinar/Feedback/feedbackform';


// 🔹 Pages
// import CompanyListPage from '../pages/organizations/CompanyListPage';
// import coorprate from '../menu-items/coorprate';


// import coorprate from 'menu-items/coorprate';

// import { Web } from '@mui/icons-material';
// import CmsList from 'pages/cms/cmslist';
// import StudentView from 'pages/usermanagement/studentView';
//Landing with login
// const LandingWithLogin = Loadable(
//   lazy(() => import('../sections/landing/landingwithlogin'))
// );




// render - dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

// User-management routing
// const CompanyListPage = Loadable(lazy(() => import('pages/usermanagement/company')));
// const StudentEmployerPage = Loadable(lazy(() => import('pages/usermanagement/studentEmployer')));
const StudentsListPage = Loadable(lazy(() => import('pages/usermanagement/studentslist')));
const StudentView = Loadable(lazy(() => import('pages/usermanagement/studentView')));
const TutorsListPage = Loadable(lazy(() => import('pages/usermanagement/tutorlist')));
const TutorView = Loadable(lazy(() => import('pages/usermanagement/studentView')));
const AdminsListPage = Loadable(lazy(() => import('pages/usermanagement/adminlist')));
const AdminView = Loadable(lazy(() => import('pages/usermanagement/studentView')));
const BatchListPage = Loadable(lazy(() => import('pages/usermanagement/batchlist')));
const EnquiryList = Loadable(
  lazy(() => import('pages/usermanagement/enquirylist'))
);

const TicketListPage = Loadable(lazy(() => import('pages/ticket/ticketlist')));
const StudentTicketPage = Loadable(lazy(() => import('pages/ticket/studentTicket')));

const UserProfile = Loadable(lazy(() => import('pages/usermanagement/userprofile')));
const MonthlyAttendance = Loadable(lazy(() => import('pages/usermanagement/monthlyattendance')));
const UserAttendance = Loadable(lazy(() => import('pages/usermanagement/attendance')));
const UserTabPersonal = Loadable(lazy(() => import('sections/profile/TabPersonal')));
const UserTabTutor = Loadable(lazy(() => import('sections/profile/TabTutor')));
const UserTabStudent = Loadable(lazy(() => import('sections/profile/TabStudent')));
const UserTabRecording = Loadable(lazy(() => import('sections/profile/TabRecording')));
const UserTabPassword = Loadable(lazy(() => import('sections/profile/TabPassword')));
//coorprate
const Logs= Loadable(lazy(() => import('sections/profile/tablog')));
const Organizations = Loadable(
  lazy(() => import('pages/usermanagement/coorprate/organizations'))
);
const OrganizationEmployee = Loadable(
  lazy(() => import('pages/usermanagement/coorprate/organizationemployee'))
);



//events
const EventScanner = Loadable(lazy(() => import('pages/events/eventscanner')));
const EventFormPage = Loadable(lazy(() => import('pages/events/eventform')));
const EventPage = Loadable(lazy(() => import('pages/events/eventlist')));
const EventView = Loadable(lazy(() => import('pages/events/eventview')));
const EventQuizPage = Loadable(lazy(() => import('pages/events/eventquiz')));
const EventPointsPage = Loadable(lazy(() => import('pages/events/eventpoints')));
const EventPollPage = Loadable(lazy(() => import('pages/events/pollpage')));

//webinar
const WebinarList = Loadable(lazy(() => import('pages/webinar/webinarlist')));
const WebinarView = Loadable(lazy(() => import('pages/webinar/webinarview')));
const Feedback = Loadable(
lazy(() => import('pages/webinar/Feedback/feedbackform'))
);

// const ParticipantTable = Loadable(lazy(() => import('pages/webinar/webinarview')));

//course
const Certification = Loadable(lazy(() => import('pages/course/certification')));
const CourseView = Loadable(lazy(() => import('pages/course/courseview')));
const CourseDetail = Loadable(lazy(() => import('pages/course/coursedetail')));
const AssessmentList = Loadable(lazy(() => import('pages/course/AssessmentList')));
const AssessmentQuestions = Loadable(lazy(() => import('pages/course/AdminAssmentsTab.js')));
const SchedulesTab = Loadable(lazy(() => import('pages/course/SchedulesTab')));

//category
const CategoryList = Loadable(lazy(() => import('pages/category/categorylist')));

//paymet & invoice
const InvoiceList = Loadable(lazy(() => import('pages/payment/invoiceList')));
const InvoiceDesign = Loadable(lazy(() => import('pages/payment/invoice')));

//logs
const AttendeceLogs = Loadable(lazy(() => import('pages/history/attendancelogs')));
const ActivityLogs = Loadable(lazy(() => import('pages/history/activitylogs')));

//roles
const RolesTable = Loadable(lazy(() => import('pages/roles/roleslist')));

//settings
const Settings = Loadable(lazy(() => import('pages/settings/settings')));
const Announcements = Loadable(lazy(() => import('pages/settings/announcements')));

//cms
const CmsList = Loadable(lazy(() => import('pages/cms/cmslist')));
// const TemplateCms = Loadable(lazy(() => import('pages/cms/cmstemplate')));

//Reports
const Reports = Loadable(lazy(() => import('pages/reports/reports')));
const OrganizationReportsPage = Loadable(lazy(() => import('pages/reports/mainReport')));
const StudentReportsPage = Loadable(lazy(() => import('pages/reports/mainReport')));
const TutorReportsPage = Loadable(lazy(() => import('pages/reports/tutorReport')));
const PaymentReportsPage = Loadable(lazy(() => import('pages/reports/paymentReport')));

// pages routing
const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/error/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction/under-construction')));
const MaintenanceUnderConstruction2 = Loadable(lazy(() => import('pages/maintenance/under-construction/under-construction2')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon/coming-soon')));
const MaintenanceComingSoon2 = Loadable(lazy(() => import('pages/maintenance/coming-soon/coming-soon2')));

// render - sample page
// const Landing = Loadable(lazy(() => import('pages/landing')));
const ContactUS = Loadable(lazy(() => import('pages/contact-us')));
const TermsAndConditions = Loadable(lazy(() => import('layout/CommonLayout/terms-and-conditions')));
const PrivacyPolicy = Loadable(lazy(() => import('layout/CommonLayout/privacy-policy')));
const RefundPolicy = Loadable(lazy(() => import('layout/CommonLayout/refund-policy')));



// ==============================|| MAIN ROUTES ||============================== //

const MainRoutes = {
  id: 'navigation',
  title: 'Navigation',
  type: 'group',
  path: '/',
  children: [
    {
      path: '/',
      element: <Login />
    },
    // {
    //   Breadcrumbs: false,
    //   path: '/:title',
    //   element: <TemplateCms />
    // },
    {
      title: 'Home',
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          path: 'dashboard',
          children: [
            {
              index: true,
              element: <DashboardDefault />
            },
            {
              title: 'Corporate',
              path: 'corporate',
              children: [
                {
                  title: 'Organizations',
                  path: 'organizations',
                  element: (
                    <PermissionGuard module="Organizations">
                      <Organizations />
                    </PermissionGuard>
                  )
                },
                {
                  title:'organization-employees',
                  path: 'organization-employees',
                  element: (
                    <PermissionGuard module="Organization Employer">
                      <OrganizationEmployee />
                    </PermissionGuard>
                  )
                }
              ]
            }
          ]
        },
        //  {
        //           path: 'organization-employees',
        //           element: (
        //             <PermissionGuard module="Organization Employer">
        //               <OrganizationEmployee />
        //             </PermissionGuard>
        //           )
        //         },
        //  {
         
           
        //           title: 'Organizations',
        //           path: 'organizations',
        //           element: (
        //             <PermissionGuard module="Organizations">
        //               <Organizations />
        //             </PermissionGuard>
        //           )
                
        // },


        {
          id: 'Admins',
          title: 'Admins',
          path: 'admins',
          element: (
            <PermissionGuard module="Admins">
              <AdminsListPage />
            </PermissionGuard>
          )
        },
        {
          title: 'Admin Details',
          path: 'admins/:Id',
          element: (
            <PermissionGuard module="Admins">
              <AdminView />
            </PermissionGuard>
          )
        },
        {
          id: 'Tutors',
          title: 'Tutors',
          path: 'tutors',
          element: (
            <PermissionGuard module="Tutors">
              <TutorsListPage />
            </PermissionGuard>
          )
        },
        {
          title: 'Tutor Details',
          path: 'tutors/:Id',
          element: (
            <PermissionGuard module="Tutors">
              <TutorView />
            </PermissionGuard>
          )
        },
        {
          title: 'Students',
          path: 'students',
          element: (
            <PermissionGuard module="Students">
              <StudentsListPage />
            </PermissionGuard>
          )
        },
        {
          title: 'Student Details',
          path: 'students/:Id',
          element: (
            <PermissionGuard module="Students">
              <StudentView />
            </PermissionGuard>
          )
        },
        // {
        //   path: 'organizations',
        //   element: (
        //     <PermissionGuard module="Organizations">
        //       <CompanyListPage />
        //     </PermissionGuard>
        //   )
        // },
        // {
        //   path: 'organization-employer',
        //   element: (
        //     <PermissionGuard module="Organization Employer">
        //       <OrganizationEmployerPage />
        //     </PermissionGuard>
        //   )
        // },
        {
          title: 'Batch',
          path: 'batch',
          element: (
            <PermissionGuard module="Batch">
              <BatchListPage />
            </PermissionGuard>
          )
        },
        {
          title: 'Enquiry List',
          path: 'enquiry-list',
          element: <EnquiryList />
        },

        {
          title: 'Ticket List',
          path: 'ticket-list',
          element: (
            // <PermissionGuard module="Enquery List">
            <TicketListPage />
            // </PermissionGuard>
          )
        },
        {
          title: 'Ticket',
          path: 'ticket',
          element: (
            // <PermissionGuard module="Enquery List">
            <StudentTicketPage />
            // </PermissionGuard>
          )
        },
        {
          title: 'Attendance',
          path: 'attendance',
          element: <UserAttendance />
        },
        {
          title: 'Monthly Details',
          path: 'attendance-monthly-dedails',
          element: <MonthlyAttendance />
        },
        {
          path: 'user',
          title: 'Users',
          type: 'group',
          element: <UserProfile />,
          children: [
            {
              type: 'item',
              title: 'Personal',
              path: 'personal',
              element: <UserTabPersonal />
            },
            {
              type: 'item',
              title: 'Tutor',
              path: 'tutor',
              element: <UserTabTutor />
            },
            {
              type: 'item',
              title: 'Student',
              path: 'student',
              element: <UserTabStudent />
            },
            {
              type: 'item',
              title: 'Recording',
              path: 'recording',
              element: <UserTabRecording />
            },
            {
              title: 'Password',
              path: 'password',
              element: <UserTabPassword />
            },
            {
              title: 'Certificate',
              path: 'certificate',
              element: <Certification />
            },
            {
              title:'logs',
              path:'logs',
              element:<Logs/>
            }
          ]
        },
        {
          title: 'Report',
          path: 'report',
          element: <Reports />
        },
        {
          title: 'Organization Reports',
          path: 'reports/organization-reports',
          element: (
            <PermissionGuard module="Reports">
              <OrganizationReportsPage />
            </PermissionGuard>
          )
        },
        {
          title: 'Student Reports',
          path: 'reports/student-reports',
          element: (
            <PermissionGuard module="Reports">
              <StudentReportsPage />
            </PermissionGuard>
          )
        },
        {
          title: 'Tutor Reports',
          path: 'reports/tutor-reports',
          element: (
            <PermissionGuard module="Reports">
              <TutorReportsPage />
            </PermissionGuard>
          )
        },
        {
          title: 'Payment Reports',
          path: 'reports/payment-reports',
          element: <PaymentReportsPage />
        },
        {
          title: 'Course',
          path: 'course',
          element: (
            <PermissionGuard module="Course">
              <CourseView />
            </PermissionGuard>
          )
        },
        {
          title: 'Course Detail',
          path: 'course/:Id',
          element: (
            <PermissionGuard module="Course">
              <CourseDetail />
            </PermissionGuard>
          )
        },
        {
          title: 'Schedule',
          path: 'schedule',
          element: (
            <PermissionGuard module="Schedule">
              <SchedulesTab />
            </PermissionGuard>
          )
        },
        {
          title: 'Category',
          path: 'category',
          element: (
            <PermissionGuard module="Category">
              <CategoryList />
            </PermissionGuard>
          )
        },
        {
          title: 'Assessment',
          path: 'assessment',
          element: (
            <PermissionGuard module="Assessment">
              <AssessmentList />
            </PermissionGuard>
          )
        },
        {
          title: 'Questions',
          path: 'assessment/questions/:Id',
          element: (
            <PermissionGuard module="Assessment">
              <AssessmentQuestions />
            </PermissionGuard>
          )
        },
        {
          title: 'Invoice',
          path: 'invoice',
          element: <InvoiceList />
        },
        {
          title: 'Invoice Design',
          path: 'invoice-design',
          element: <InvoiceDesign />
        },
        {
          title: 'Roles & Permissions',
          path: 'roles',
          element: (
            <PermissionGuard module="Roles">
              <RolesTable />
            </PermissionGuard>
          )
        },
        {
          title: 'Settings',
          path: 'settings',
          element: (
            <PermissionGuard module="Settings">
              <Settings />
            </PermissionGuard>
          )
        },
        {
          title: 'Announcements',
          path: 'announcements',
          element: (
            <PermissionGuard module="Announcements">
              <Announcements />
            </PermissionGuard>
          )
        },
        {
          title: 'CMS',
          path: 'cms',
          element: <CmsList />
        },
        {
          title: 'Attendance Logs',
          path: 'attendance-logs',
          element: (
            // <PermissionGuard module="Attendance Logs">
            <AttendeceLogs />
            // </PermissionGuard>
          )
        },
        {
          title: 'Activity Logs',
          path: 'activity-logs',
          element: <ActivityLogs />
        },
        {
          title: 'Events List',
          path: 'events',
          element: <EventPage />
        },
        {
          title: 'Events View',
          path: 'events/:id',
          element: <EventView />
        },
        {
          title: 'Webinar List',
          path: 'webinar',
          element: <WebinarList />
        },
        {
          title: 'Webinar View',
          path: 'webinar/:id/',
          element: <WebinarView />
        },
         {
      path: '/webinar/feedback',
      element: <Feedback />
    }
      ]
    },

  


    // {
    //   path: '/',
    //   element: <CommonLayout layout="landing" />,
    //   children: [
    //     {
    //       path: 'landing',
    //       element: <Landing />
    //     }
    //   ]
    // },
    {
      path: '/',
      element: <CommonLayout layout="simple" />,
      children: [
        {
          path: 'contact-us',
          element: <ContactUS />
        },
        {
          path: 'terms-and-conditions',
          element: <TermsAndConditions />
        },
        {
          path: 'privacy-policy',
          element: <PrivacyPolicy />
        },
        {
          path: 'refund-policy',
          element: <RefundPolicy />
        }
      ]
    }, 
    {
      path: '/feedback/:id',
      element: <WebinarFeedbackForm />

    },
    {
      path: '/events/:id/qr',
      element: <EventScanner />
    },
    {
      path: '/events/user/:Id/form/in',
      element: <EventFormPage />
    },
    {
      path: '/events/user/:Id/quiz/in',
      element: <EventQuizPage />
    },
    {
      path: '/events/user/:Id/points/in',
      element: <EventPointsPage />
    },
    {
      path: '/events/user/:Id/poll/in',
      element: <EventPollPage />
    },
    {
      path: '/maintenance',
      element: <CommonLayout />,
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError500 />
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />
        },
        {
          path: 'under-construction2',
          element: <MaintenanceUnderConstruction2 />
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon />
        },
        {
          path: 'coming-soon2',
          element: <MaintenanceComingSoon2 />
        }
      ]
    },
    {
      path: '*',
      element: <CommonLayout />,
      children: [
        {
          path: '*',
          element: <MaintenanceError />
        }
      ]
    },
    // {
    //   Breadcrumbs: false,
    //   path: '/:title',
    //   element: <TemplateCms />
    // },
  ]

};

export default MainRoutes;
