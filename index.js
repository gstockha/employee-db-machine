const inq = require('inquirer');
const db = require('./db/connection.js');

const {
    promptManagerQuery,
    promptDepartmentQuery,
    addDepartment,
    addRole,
    addEmployee,
    updateEmployeeRole
} = require('./utils/dbScripts.js');

function mainPrompt(){
    inq.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: ['View Departments', 'View Roles', 'View Employees',
        'View Employees with a certain Manager', 'View Employees in a Department',
        'Add Department', 'Add Role', 'Add Employee', 'Update an Employee Role', 'Exit']
    })
    .then((answer)=>{
        let sql;
        if (answer.action === 'View Departments'){
            sql = "select departments.id as 'ID', departments.name as 'Department' from departments";
            drawTable(sql, null);
        }
        else if (answer.action === 'View Roles'){
            sql = "select roles.id as 'ID', roles.title as 'Job Title', roles.salary as 'Salary',"
            + "departments.name as 'Department' from roles " + 
            "left join departments on roles.dept_id = departments.id";
            drawTable(sql, null);
        }
        else if (answer.action === 'View Employees'){
            sql = "select employees.s1.id as 'ID', s1.first_name as 'First Name', s1.last_name as 'Last Name'," +
            "roles.title 'Job Title', departments.name as 'Department'," +
            "(CONCAT(s2.first_name,' ',s2.last_name)) as 'Manager Name', roles.salary as 'Salary' " +
            "from employees s1 " +
            "left join roles on s1.role_id = roles.id " +
            "left join employees s2 on s1.manager_id = s2.id " + 
            "left join departments on roles.dept_id = departments.id";
            drawTable(sql, null);
        }
        else if (answer.action === 'View Employees with a certain Manager'){
            promptManagerQuery();
        }
        else if (answer.action === 'View Employees in a Department'){
            promptDepartmentQuery();
        }
        else if (answer.action === 'Add Department'){
            addDepartment();
        }
        else if (answer.action === 'Add Role'){
            addRole();
        }
        else if (answer.action === 'Add Employee'){
            addEmployee();
        }
        else if (answer.action === 'Update an Employee Role'){
            updateEmployeeRole();
        }
        else if (answer.action === 'Exit'){
            return console.log('Goodbye!');
        }
    })
}

function drawTable(query, param){
    db.query(query, param, (err, result) =>{
        if (err){
            console.log(err);
            return mainPrompt();
        }
        console.table(result);
        return mainPrompt();
    })
}

console.log('--- Welcome to the Employee DB Machine! ---');

mainPrompt();