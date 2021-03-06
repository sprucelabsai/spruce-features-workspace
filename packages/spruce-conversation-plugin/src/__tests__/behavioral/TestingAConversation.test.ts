import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import { ConversationFeature } from '../../plugins/conversation.plugin'
import AbstractConversationTest from '../../tests/AbstractConversationTest'

export default class TestingAConversationTest extends AbstractConversationTest {
	protected static async afterEach() {
		await super.afterEach()
		process.env.ACTION = undefined
	}

	protected static async afterAll() {
		await super.afterAll()
		process.env.ACTION = undefined
	}

	@test()
	protected static async bootingNormallyDoesNotGoToTestMode() {
		const conversation = await this.bootAndGetConversationFeature()

		assert.isFalse(conversation.isTesting())
		this.clearSkillBootErrors()
	}

	@test()
	protected static async bootsInTestModeWithProperAction() {
		process.env.ACTION = 'test.conversation'
		const conversation = await this.bootAndGetConversationFeature()

		assert.isTrue(conversation.isTesting())
	}

	@test()
	protected static async throwsWithBadScript() {
		this.cwd = this.resolveTestPath('bad-skill')
		process.env.ACTION = 'test.conversation'
		const skill = this.Skill()
		const err = await assert.doesThrowAsync(() => skill.execute())

		errorAssertUtil.assertError(err, 'INVALID_TOPIC')
	}

	@test()
	protected static async throwsWithThrowsInScript() {
		this.cwd = this.resolveTestPath('skill-with-script-that-throws')
		process.env.ACTION = 'test.conversation'
		process.env.FIRST_MESSAGE = 'hey there!'
		const skill = this.Skill()

		const err = await assert.doesThrowAsync(() => skill.execute())

		errorAssertUtil.assertError(err, 'CONVERSATION_ABORTED')
	}

	private static async bootAndGetConversationFeature() {
		const skill = await this.bootSkill()
		const conversation = skill.getFeatureByCode(
			'conversation'
		) as ConversationFeature

		return conversation
	}
}
