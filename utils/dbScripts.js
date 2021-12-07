const inq = require('inquirer');
const db = require('../db/connection.js');

function promptManagerQuery(){
    db.query('select id, first_name, last_name from employees where manager_id is null', (err, result)=>{
        if (err){
            console.log(err);
            return;
        }
        let nameList = [];
        for (let i = 0; i < result.length; i++){
            nameList.push(result[i].first_name + ' ' + result[i].last_name);
        }
        inq.prompt({
            type: 'list',
            name: 'manager',
            message: 'Which manager would you like to find the employees of?',
            choices: nameList
        })
        .then((choice)=>{
            let first = choice.manager.split(' ');
            let last = first[1];
            first = first[0];
            let target = null;
            for (let i = 0; i < result.length; i++){
                if ((result[i].first_name === first) && (result[i].last_name === last)){
                    target = result[i].id;
                    break;
                }
            }
            if (target !== null){
                let sql = "select id as 'ID', first_name as 'First Name', " +
                "last_name as 'Last Name' from employees where manager_id = ?";
                drawTable(sql, target);
            }
            else{
                console.log('Manager not found!');
                return;
            }
        })
    })
}

function promptDepartmentQuery(){
    db.query("select * from departments", (err, result)=>{
        if (err){
            console.log(err);
            return;
        }
        let deptList = [];
        for (let i = 0; i < result.length; i++){
            deptList.push(result[i].name);
        }
        inq.prompt({
            type: 'list',
            name: 'department',
            message: 'Which Department would you like the employees of?',
            choices: deptList
        })
        .then((choice)=>{
            let target = null;
            for (let i = 0; i < result.length; i++){
                if (result[i].name === choice.department){
                    target = result[i].id;
                    break;
                }
            }
            if (target !== null){
                let sql = "select id from roles where dept_id = ?";
                db.query(sql, target, (err, result) =>{
                    if (err){
                        console.log(err);
                        return;
                    }
                    let sqlStr = "";
                    let idList = [];
                    for (let i = 0; i < result.length; i++){
                        if (i > 0) sqlStr += " OR "
                        else sqlStr += "where ";
                        sqlStr += "role_id = " + result[i].id;
                        idList.push(result[i].id)
                    }
                    sqlStr += ";";
                    sql = "select id as 'ID', first_name as 'First Name', last_name as 'Last Name' " +
                    "from employees " + sqlStr;
                    drawTable(sql, idList);
                })
            }
            else{
                console.log('Department not found!');
                return;
            }
        })
    })
}

function addDepartment(){
    inq.prompt({
        type: 'input',
        name: 'department',
        message: 'What would you like to call the Department?'
    })
    .then(answer =>{
        let dept = answer.department.replace(/\s+/g, '_');
        const sql = 'insert into departments (name) values (?)';
        db.query(sql, dept, (err, result)=>{
            if (err){
                console.log(err);
                return;
            }
            console.log(`Added ${dept} to the Departments table!`);
            return;
        })
    })
}

function addRole(){
    db.query('select * from departments', (err, result)=>{
        if (err){
            console.log(err);
            return;
        }
        let deptNames = [];
        for (let i = 0; i < result.length; i++){
            deptNames.push(result[i].name);
        }
        inq.prompt([
            {
                type: 'input',
                name: 'role',
                message: 'What would you like to call the Role?'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of this role?'
            },
            {
                type: 'list',
                name: 'department',
                message: 'Which Department does this Role belong to?',
                choices: deptNames
            }
        ])
        .then(answer =>{
            let role = answer.role.replace(/\s+/g, '_');
            let target = null;
            for (let i = 0; i < result.length; i++){
                if (answer.department === result[i].name){
                    target = result[i].id;
                    break;
                }
            }
            if (target !== null){
                let params = [answer.role, answer.salary, target];
                const sql = 'insert into roles (title, salary, dept_id) values (?, ?, ?)';
                db.query(sql, params, (err, result)=>{
                    if (err){
                        console.log(err);
                        return;
                    }
                    console.log(`Added ${role} to the Roles table!`);
                    return;
                })
            }
            else{
                console.log('Department not found!');
                return;
            }
        })
    })
}

function addEmployee(){
    db.query('select id, first_name, last_name from employees where manager_id is null', (err, managerResult)=>{
        let managerNames = [];
        for (let i = 0; i < managerResult.length; i++){
            managerNames.push(managerResult[i].first_name + ' ' + managerResult[i].last_name);
        }
        db.query("select * from roles", (err, roleResult)=>{
            let roleNames = [];
            for (i = 0; i < roleResult.length; i++){
                roleNames.push(roleResult[i].title);
            }
            inq.prompt([
                {
                    type: 'input',
                    name: 'first',
                    message: "What is the employee's first name?"
                },
                {
                    type: 'input',
                    name: 'last',
                    message: "What is the employee's last name?"
                },
                {
                    type: 'list',
                    name: 'role',
                    message: "What will be this Employee's Role?",
                    choices: roleNames
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: "Who will be this Employee's Manager?",
                    choices: managerNames
                }
            ])
            .then(answer =>{
                let managerTarget = null;
                let roleTarget = null;
                let manFirst = answer.manager.split(' ');
                let manLast = manFirst[1];
                manFirst = manFirst[0];
                for (i = 0; i < managerResult.length; i++){
                    if ((manFirst === managerResult[i].first_name) && (manLast === managerResult[i].last_name)){
                        managerTarget = managerResult[i].id;
                        break;
                    }
                }
                for (i = 0; i < roleResult.length; i++){
                    if (roleResult[i].title === answer.role){
                        roleTarget = roleResult[i].id;
                        break;
                    }
                }
                if ((managerTarget !== null) && (roleTarget !== null)){
                    let first = answer.first.replace(/\s+/g, '_');
                    let last = answer.last.replace(/\s+/g, '_');
                    const params = [first, last, roleTarget, managerTarget];
                    const sql = 'insert into employees (first_name, last_name, role_id, manager_id) values (?,?,?,?)';
                    db.query(sql, params, (err, result)=>{
                        if (err){
                            console.log(err);
                            return;
                        }
                        console.log(`Added ${first} to the Employees table!`);
                        return;
                    })
                }
                else{
                    console.log('Cannot find Manager or Role!');
                    return;
                }
            })
        })
    })
}

function updateEmployeeRole(){
    db.query('select * from employees', (err, employeeResult)=>{
        let employeeList = [];
        for (let i = 0; i < employeeResult.length; i++){
            employeeList.push(employeeResult[i].first_name + ' ' + employeeResult[i].last_name);
        }
        db.query('select * from roles', (err, roleResult)=>{
            let roleList = [];
            for (i = 0; i < roleResult.length; i++) roleList.push(roleResult[i].title);
            inq.prompt([
                {
                    type: 'list',
                    name: 'name',
                    message: 'Which Employee would you like to update?',
                    choices: employeeList
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'Which Role should this Employee be?',
                    choices: roleList 
                }
            ])
            .then(answer =>{
                let employeeTarget = null;
                let roleTarget = null;
                let first = answer.name.split(' ');
                let last = first[1];
                first = first[0];
                for (i = 0; i < employeeResult.length; i++){
                    if ((employeeResult[i].first_name === first) && (employeeResult[i].last_name === last)){
                        employeeTarget = employeeResult[i].id;
                        break;
                    }
                }
                for (i = 0; i < roleResult.length; i++){
                    if (roleResult[i].title === answer.role){
                        roleTarget = roleResult[i].id;
                        break;
                    }
                }
                if ((employeeTarget !== null) && (roleTarget !== null)){
                    const params = [roleTarget, employeeTarget];
                    db.query("update employees set role_id = ? where id = ?", params, (err, result)=>{
                        if (err){
                            console.log(err);
                            return;
                        }
                        console.log(`${first}'s Role was updated!`);
                        return;
                    })
                }
                else{
                    console.log('Employee or Role not found!');
                    return;
                }
            })
        })
    })
}

function drawTable(query, param){
    db.query(query, param, (err, result) =>{
        if (err){
            console.log(err);
            return;
        }
        console.table(result);
        return;
    })
}


module.exports = {
    promptManagerQuery,
    promptDepartmentQuery,
    addDepartment,
    addRole,
    addEmployee,
    updateEmployeeRole
}