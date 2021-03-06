import { StoreFactory } from '@sprucelabs/data-stores'
import { test, assert } from '@sprucelabs/test'
import AbstractStoreTest from '../../tests/AbstractStoreTest'

export default class AddsStoreFactoryToSkillContextTest extends AbstractStoreTest {
	@test()
	protected static async canCreateAddsStoreFactoryToSkillContext() {
		const context = await this.bootAndGetContext()

		assert.isTruthy(context.storeFactory)
	}

	private static async bootAndGetContext() {
		const skill = this.SkillFromTestDir('one-good-store-skill')

		void skill.execute()

		await this.waitUntilSkillIsBooted(skill)

		const context = skill.getContext()
		return context
	}

	@test()
	protected static async storeFactoryIsTyped() {
		const context = await this.bootAndGetContext()
		type Context = typeof context

		assert.isExactType<Context['storeFactory'], StoreFactory>(true)
	}
}
