import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { test, assert } from '@sprucelabs/test'
import { EventFeature } from '../../plugins/event.plugin'
import AbstractEventPluginTest from '../../tests/AbstractEventPluginTest'

export default class LoggingInAsCurrentSkillTest extends AbstractEventPluginTest {
	@test()
	protected static async logsInAnonByDefault() {
		const results = await this.login()
		const { type } = eventResponseUtil.getFirstResponseOrThrow(results)
		assert.isEqual(type, 'anonymous')
	}

	@test()
	protected static async logsInAsSkillIfEnvVarsAreSet() {
		const skill = await this.Fixture('skill').seedDemoSkill({
			name: 'event test skill',
		})

		process.env.SKILL_ID = skill.id
		process.env.SKILL_API_KEY = skill.apiKey

		const results = await this.login()

		const { type, auth } = eventResponseUtil.getFirstResponseOrThrow(results)
		assert.isEqual(type, 'authenticated')

		assert.isEqual(auth.skill.id, skill.id)
	}

	private static async login() {
		const skill = this.Skill()
		const feature = skill.getFeatureByCode('event') as EventFeature
		const { client } = await feature.connectToApi()
		const results = await client.emit('whoami::v2020_12_25')
		return results
	}
}
