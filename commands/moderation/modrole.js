const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const modRolesPath = path.join(__dirname, '../../data/modRoles.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('modrole')
    .setDescription('Manage moderator roles.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a role to moderator roles.')
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Role to add')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a role from moderator roles.')
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Role to remove')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all moderator roles.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    // Load existing mod roles
    let modRoles = {};
    if (fs.existsSync(modRolesPath)) {
      modRoles = JSON.parse(fs.readFileSync(modRolesPath));
    }

    if (!modRoles[guildId]) {
      modRoles[guildId] = [];
    }

    if (subcommand === 'add') {
      const role = interaction.options.getRole('role');
      if (modRoles[guildId].includes(role.id)) {
        return interaction.reply({ content: 'This role is already a moderator role.', ephemeral: true });
      }
      modRoles[guildId].push(role.id);
      fs.writeFileSync(modRolesPath, JSON.stringify(modRoles, null, 2));
      await interaction.reply(`Added ${role.name} to moderator roles.`);
    } else if (subcommand === 'remove') {
      const role = interaction.options.getRole('role');
      if (!modRoles[guildId].includes(role.id)) {
        return interaction.reply({ content: 'This role is not a moderator role.', ephemeral: true });
      }
      modRoles[guildId] = modRoles[guildId].filter(id => id !== role.id);
      fs.writeFileSync(modRolesPath, JSON.stringify(modRoles, null, 2));
      await interaction.reply(`Removed ${role.name} from moderator roles.`);
    } else if (subcommand === 'list') {
      if (modRoles[guildId].length === 0) {
        return interaction.reply('No moderator roles have been set.');
      }
      const roles = modRoles[guildId].map(id => `<@&${id}>`).join(', ');
      await interaction.reply(`Moderator roles: ${roles}`);
    }
  },
};
