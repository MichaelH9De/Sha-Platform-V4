import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.report.deleteMany();
  await prisma.reportTemplate.deleteMany();
  await prisma.bIMRecord.deleteMany();
  await prisma.qAReview.deleteMany();
  await prisma.resourceAllocation.deleteMany();
  await prisma.feeForecast.deleteMany();
  await prisma.feeBudget.deleteMany();
  await prisma.informationRequest.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.action.deleteMany();
  await prisma.deliverable.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.scopeItem.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.deliverableTemplate.deleteMany();
  await prisma.stageTemplate.deleteMany();
  await prisma.discipline.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  const roles = await Promise.all([
    prisma.role.create({ data: { name: "Director", description: "Leadership, portfolio, commercial and escalation control." } }),
    prisma.role.create({ data: { name: "Project Manager", description: "Assigned project delivery and reporting." } }),
    prisma.role.create({ data: { name: "Engineer", description: "Assigned deliverables and actions." } }),
    prisma.role.create({ data: { name: "Client/External", description: "Approved external report access only." } })
  ]);

  const permissions = await Promise.all([
    ["project:create", "Create projects"],
    ["deliverable:update", "Update deliverables"],
    ["risk:update", "Update risks"],
    ["fee:update", "Update fee forecasts"],
    ["report:generate", "Generate reports"]
  ].map(([key, description]) => prisma.permission.create({ data: { key, description } })));

  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({ roleId: roles[0].id, permissionId: permission.id }))
  });

  const director = await prisma.user.create({
    data: { id: "seed-director", name: "Demo Director", email: "director@example.invalid", roleId: roles[0].id }
  });
  const pm = await prisma.user.create({
    data: { id: "seed-pm", name: "Demo Project Manager", email: "pm@example.invalid", roleId: roles[1].id }
  });
  const engineer = await prisma.user.create({
    data: { id: "seed-engineer", name: "Demo Mechanical Engineer", email: "engineer@example.invalid", roleId: roles[2].id }
  });

  const disciplines = await Promise.all([
    ["Mechanical", "MECH"],
    ["Electrical", "ELEC"],
    ["Public Health", "PH"],
    ["Sustainability", "SUST"],
    ["BIM/Revit", "BIM"]
  ].map(([name, code]) => prisma.discipline.create({ data: { name, code } })));

  const stageTemplate = await prisma.stageTemplate.create({
    data: { name: "RIBA/BSRIA Design Delivery", description: "Consultancy design-stage template aligned to staged UK building-services delivery." }
  });

  await prisma.deliverableTemplate.createMany({
    data: disciplines.slice(0, 3).map((discipline) => ({
      stageTemplateId: stageTemplate.id,
      disciplineId: discipline.id,
      name: `${discipline.name} design deliverables`
    }))
  });

  const client = await prisma.client.create({
    data: { name: "Demo Public Sector Client", sector: "Public sector", contactOwnerId: director.id, status: "OPEN" }
  });

  const project = await prisma.project.create({
    data: {
      id: "seed-project-1",
      clientId: client.id,
      name: "Civic Retrofit MEP Design",
      sector: "Public sector",
      projectManagerId: pm.id,
      status: "LIVE",
      health: "AMBER",
      stageTemplateId: stageTemplate.id
    }
  });

  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: director.id, canManage: true },
      { projectId: project.id, userId: pm.id, canManage: true },
      { projectId: project.id, userId: engineer.id, disciplineId: disciplines[0].id }
    ]
  });

  const stage = await prisma.stage.create({
    data: {
      projectId: project.id,
      name: "Stage 3 Spatial Coordination",
      order: 3,
      plannedStart: new Date("2026-06-01"),
      plannedEnd: new Date("2026-07-31"),
      actualStatus: "IN_PROGRESS",
      ownerId: pm.id
    }
  });

  const appointment = await prisma.appointment.create({
    data: {
      projectId: project.id,
      scopeSummary: "MEP design consultancy services for retrofit design-stage coordination.",
      startDate: new Date("2026-05-20"),
      feeBasis: "Fixed fee by stage",
      status: "OPEN"
    }
  });

  await prisma.scopeItem.create({
    data: {
      appointmentId: appointment.id,
      disciplineId: disciplines[0].id,
      description: "Mechanical ventilation and heating design coordination",
      included: true
    }
  });

  const deliverable = await prisma.deliverable.create({
    data: {
      projectId: project.id,
      stageId: stage.id,
      disciplineId: disciplines[0].id,
      ownerId: engineer.id,
      title: "Mechanical Stage 3 Design Note",
      dueDate: new Date("2026-07-10"),
      status: "IN_PROGRESS",
      qaStatus: "IN_REVIEW"
    }
  });

  await prisma.risk.create({
    data: {
      projectId: project.id,
      ownerId: pm.id,
      severity: "HIGH",
      likelihood: "MEDIUM",
      mitigation: "Escalate missing survey inputs and record assumptions before Stage 3 gate.",
      status: "OPEN",
      description: "Existing plantroom survey information is incomplete."
    }
  });

  await prisma.action.create({
    data: {
      projectId: project.id,
      ownerId: engineer.id,
      dueDate: new Date("2026-06-28"),
      priority: "HIGH",
      status: "OPEN",
      description: "Confirm plant replacement strategy assumptions with architect and client."
    }
  });

  await prisma.feeBudget.create({
    data: { projectId: project.id, disciplineId: disciplines[0].id, budgetHours: 120, budgetValue: 15000 }
  });

  await prisma.feeForecast.create({
    data: { projectId: project.id, actualHours: 72, forecastHours: 138, varianceValue: -2250, status: "OPEN", notes: "Mechanical coordination running above allowance." }
  });

  await prisma.resourceAllocation.create({
    data: {
      userId: engineer.id,
      projectId: project.id,
      disciplineId: disciplines[0].id,
      weekStart: new Date("2026-06-22"),
      plannedHours: 28,
      capacityHours: 35
    }
  });

  await prisma.qAReview.create({
    data: {
      deliverableId: deliverable.id,
      reviewerId: pm.id,
      status: "IN_REVIEW",
      comments: "Check assumptions and coordination notes before issue.",
      internalComments: "Do not issue until survey assumption is made explicit.",
      approvalState: "Pending"
    }
  });

  await prisma.bIMRecord.create({
    data: {
      projectId: project.id,
      modelReference: "Civic-Retrofit-MEP-Stage3.rvt",
      disciplineId: disciplines[4].id,
      status: "OPEN",
      lastCheckedAt: new Date("2026-06-16"),
      cdeLink: "https://example.invalid/cde/model"
    }
  });

  const template = await prisma.reportTemplate.create({
    data: {
      name: "Client Progress Report",
      audience: "CLIENT",
      allowlistedFields: "projectName,stage,status,health,deliverableProgress,openActions,clientInformationRequired,approvedDecisions,nextSteps"
    }
  });

  await prisma.report.create({
    data: {
      projectId: project.id,
      templateId: template.id,
      audience: "CLIENT",
      status: "DRAFT",
      generatedById: pm.id,
      snapshotJson: JSON.stringify({ projectName: project.name, stage: stage.name, status: project.status, health: project.health })
    }
  });

  await prisma.auditEvent.create({
    data: {
      entityType: "Project",
      entityId: project.id,
      action: "SEED_CREATE",
      newValue: JSON.stringify({ name: project.name }),
      actorId: director.id
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
